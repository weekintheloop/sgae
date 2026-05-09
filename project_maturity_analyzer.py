#!/usr/bin/env python3
"""
Enterprise Project Maturity Analyzer (EPMA) v5.0 - UNIAE CRE Edition
=====================================================================
Ferramenta enterprise para análise de maturidade do Sistema UNIAE CRE.
Otimizada para Google Apps Script e sistemas de gestão governamental.

Features Enterprise v5.0 - UNIAE CRE:
- Análise multi-dimensional com 18 categorias específicas para AE
- Métricas DORA e SPACE adaptadas para GAS
- Análise de workflows de atesto e recebimento
- Verificação de compliance com legislação brasileira (Lei 4.320, LGPD)
- Análise do AE Design System e Mobile First
- Métricas de integração GAS detalhadas
- Análise de domínios de negócio (Notas Fiscais, Empenhos, etc.)
- Verificação de padrões arquiteturais AE
- Análise de segurança OWASP adaptada
- Relatórios executivos e técnicos
- Exportação multi-formato (JSON, MD, HTML)

Autor: Kiro AI Assistant
Versão: 5.0.0 Enterprise - UNIAE CRE Edition
Data: 2026-01-05
"""

from __future__ import annotations

import os
import re
import sys
import json
import hashlib
import argparse
import subprocess
from abc import ABC, abstractmethod
from pathlib import Path
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Tuple, Optional, Set, Any, Callable
from collections import defaultdict, Counter
from datetime import datetime, timedelta
from enum import Enum, auto
from functools import lru_cache
import math
import statistics

# ============================================================================
# VERSÃO E METADADOS
# ============================================================================

__version__ = "5.1.0"
__author__ = "Kiro AI Assistant"
__license__ = "MIT"
__project__ = "UNIAE CRE - Sistema de Atesto de Gêneros Alimentícios"


def safe_print(text: str):
    """Print com fallback para encoding que não suporta emojis/unicode especial."""
    try:
        print(text)
    except UnicodeEncodeError:
        cleaned = text.encode('ascii', 'replace').decode('ascii')
        print(cleaned)


# ============================================================================
# ENUMS E CONSTANTES ENTERPRISE v5.0 - UNIAE CRE
# ============================================================================

class MaturityLevel(Enum):
    """Níveis de maturidade baseados em CMMI e ISO 33001."""
    INITIAL = (1, "Inicial", "Processos ad-hoc e caóticos", "#e74c3c")
    MANAGED = (2, "Gerenciado", "Processos básicos estabelecidos", "#e67e22")
    DEFINED = (3, "Definido", "Processos padronizados e documentados", "#f1c40f")
    QUANTITATIVELY_MANAGED = (4, "Quantitativamente Gerenciado", "Processos medidos e controlados", "#2ecc71")
    OPTIMIZING = (5, "Otimizado", "Melhoria contínua e inovação", "#27ae60")
    
    @property
    def level(self) -> int:
        return self.value[0]
    
    @property
    def name_pt(self) -> str:
        return self.value[1]
    
    @property
    def description(self) -> str:
        return self.value[2]
    
    @property
    def color(self) -> str:
        return self.value[3]
    
    @classmethod
    def from_score(cls, score: float) -> 'MaturityLevel':
        if score >= 90: return cls.OPTIMIZING
        if score >= 75: return cls.QUANTITATIVELY_MANAGED
        if score >= 55: return cls.DEFINED
        if score >= 35: return cls.MANAGED
        return cls.INITIAL


class Severity(Enum):
    """Severidade de issues."""
    CRITICAL = (1, "Crítico", "🔴")
    HIGH = (2, "Alto", "🟠")
    MEDIUM = (3, "Médio", "🟡")
    LOW = (4, "Baixo", "🟢")
    INFO = (5, "Info", "🔵")
    
    @property
    def priority(self) -> int:
        return self.value[0]
    
    @property
    def label(self) -> str:
        return self.value[1]
    
    @property
    def icon(self) -> str:
        return self.value[2]


class AnalysisCategory(Enum):
    """Categorias de análise enterprise v5.0 - UNIAE CRE."""
    ARCHITECTURE = ("architecture", "Arquitetura AE", 0.10)
    CODE_QUALITY = ("code_quality", "Qualidade de Código", 0.10)
    DOCUMENTATION = ("documentation", "Documentação", 0.06)
    TESTING = ("testing", "Testes", 0.08)
    SECURITY = ("security", "Segurança/OWASP", 0.10)
    MAINTAINABILITY = ("maintainability", "Manutenibilidade", 0.06)
    ORGANIZATION = ("organization", "Organização", 0.05)
    PERFORMANCE = ("performance", "Performance GAS", 0.06)
    RELIABILITY = ("reliability", "Confiabilidade", 0.05)
    SCALABILITY = ("scalability", "Escalabilidade", 0.03)
    DEVOPS = ("devops", "DevOps/Clasp", 0.03)
    UX_DESIGN = ("ux_design", "UX/Design System AE", 0.06)
    BUSINESS_LOGIC = ("business_logic", "Domínios de Negócio", 0.06)
    COMPLIANCE = ("compliance", "Compliance/LGPD", 0.05)
    ACCESSIBILITY = ("accessibility", "Acessibilidade WCAG", 0.03)
    WORKFLOW_ATESTO = ("workflow_atesto", "Workflow de Atesto", 0.04)
    GAS_INTEGRATION = ("gas_integration", "Integração GAS", 0.02)
    MOBILE_FIRST = ("mobile_first", "Mobile First/S20", 0.02)
    
    @property
    def key(self) -> str:
        return self.value[0]
    
    @property
    def label(self) -> str:
        return self.value[1]
    
    @property
    def weight(self) -> float:
        return self.value[2]


# Padrões de arquitetura específicos para UNIAE CRE / GAS
ARCHITECTURE_PATTERNS_AE = {
    'layered_ae': r'(Core_|Dominio_|Infra_|UI_|Setup_|Test_)',
    'repository': r'(Repository|_Repository|Items_Repository|CRUD)',
    'service_layer': r'(Service|_Service|Core_Service|Backend_Services)',
    'workflow_engine': r'(Workflow|State|Transition|Atesto|Approver)',
    'event_driven': r'(Event|EventBus|Handler|Listener|Subscriber)',
    'ddd': r'(Dominio_|Domain|Aggregate|ValueObject|Entity)',
    'clean_architecture': r'(UseCase|UseCases|Repository|Presenter)',
    'facade': r'(API_Unified|Frontend_API|Facade|Unified)',
    'factory': r'(Factory|Builder|Setup_|Create)',
    'singleton': r'(getInstance|_instance|INSTANCE|Manager)',
}

# Padrões específicos de Google Apps Script
GAS_PATTERNS = {
    'spreadsheet_service': r'SpreadsheetApp\.',
    'drive_service': r'DriveApp\.',
    'mail_service': r'(MailApp|GmailApp)\.',
    'calendar_service': r'CalendarApp\.',
    'document_service': r'DocumentApp\.',
    'url_fetch': r'UrlFetchApp\.',
    'properties_service': r'PropertiesService\.',
    'cache_service': r'CacheService\.',
    'lock_service': r'LockService\.',
    'html_service': r'HtmlService\.',
    'content_service': r'ContentService\.',
    'script_app': r'ScriptApp\.',
    'session': r'Session\.',
    'utilities': r'Utilities\.',
    'logger': r'(Logger\.|console\.)',
    'triggers': r'(onOpen|onEdit|onInstall|doGet|doPost)',
    'gemini_ai': r'(Gemini|GenerativeModel|AI_Menu_Assistant)',
}

# Domínios de negócio UNIAE CRE
BUSINESS_DOMAINS_AE = {
    'notas_fiscais': r'(NotasFiscais|NF_|Invoice|Nota)',
    'empenhos': r'(Empenhos|Empenho|Commitment)',
    'fornecedores': r'(Fornecedores|Supplier|Fornecedor)',
    'entregas': r'(Entregas|Delivery|Recebimento)',
    'recusas': r'(Recusas|Refusal|Rejection)',
    'glosas': r'(Glosas|Glosa|Penalty)',
    'atesto': r'(Atesto|Attestation|Approval)',
    'nutricao': r'(Nutricao|Nutrition|Cardapio|Menu)',
    'educacao': r'(Educacao|Education|Escola|School)',
    'documentos': r'(Documentos|Document|SEI)',
    'relatorios': r'(Relatorios|Report|Dashboard)',
    'analises': r'(Analises|Analysis|Analytics)',
    'carbono': r'(Carbon|Crédito|Offset|Emiss)',
    'sustentabilidade': r'(Sustentabilidade|Ambiental|Ecol)',
}

# Workflows específicos do sistema de atesto
WORKFLOW_PATTERNS_AE = {
    'workflow_atesto': r'(Workflow_Atesto|Atesto_|attestation)',
    'workflow_recebimento': r'(Checklist_Recebimento|Receiving|Conferencia)',
    'workflow_nutricionista': r'(Workflow_Nutricionista|Nutrition_Workflow)',
    'workflow_analista': r'(Workflow_Analista|Analyst_Workflow)',
    'workflow_fornecedor': r'(Workflow_Fornecedor|Supplier_Workflow)',
    'workflow_representante': r'(Workflow_Representante|Representative)',
    'state_machine': r'(Status_|State|Transition|Pending|Approved|Rejected)',
    'approval_chain': r'(Approver|Approval|Authorize|Permission)',
}

# Compliance e legislação brasileira
COMPLIANCE_PATTERNS_BR = {
    'lei_4320': r'(liquidação|liquidacao|empenho|despesa)',
    'lei_11947': r'(PNAE|alimentação escolar|merenda)',
    'lei_14133': r'(fiscalização|contrato|licitação)',
    'lgpd': r'(LGPD|dados pessoais|consentimento|anonimização)',
    'anvisa': r'(ANVISA|RDC|temperatura|validade)',
    'audit_trail': r'(audit|log|trail|history|registro)',
    'access_control': r'(permission|role|access|authorize|Auth)',
    'data_protection': r'(encrypt|hash|sanitize|mask|Secure)',
}

# Design System AE
DESIGN_SYSTEM_AE = {
    'ae_design_system': r'(AE_Design_System|DesignSystem|design-system)',
    'css_variables': r'(var\(--|:root|--ae-)',
    'themes': r'(Theme_|theme|dark-mode|light-mode)',
    'responsive': r'(@media|responsive|mobile|tablet|desktop)',
    'glassmorphism': r'(glass|backdrop-filter|blur)',
    'animations': r'(animation|transition|transform|keyframes)',
    'components': r'(Component|Widget|Card|Modal|Drawer)',
    'mobile_s20': r'(Mobile_S20|S20_|viewport|touch)',
}

# Vulnerabilidades de segurança (OWASP Top 10 adaptado para GAS - mais específico)
SECURITY_VULNERABILITIES = {
    'injection': {
        # Mais específico - apenas concatenação direta em queries
        'patterns': [r'\.query\s*\([^)]*\+\s*["\']', r'\beval\s*\(\s*[^)]+\)'],
        'severity': Severity.CRITICAL,
        'owasp': 'A03:2021'
    },
    'broken_auth': {
        # Apenas senhas hardcoded reais (não em testes)
        'patterns': [r'password\s*[=:]\s*["\'][a-zA-Z0-9]{8,}["\']'],
        'severity': Severity.CRITICAL,
        'owasp': 'A07:2021'
    },
    'sensitive_exposure': {
        # Apenas chaves de API reais expostas
        'patterns': [r'(api_key|apiKey|API_KEY)\s*[=:]\s*["\'][a-zA-Z0-9]{20,}["\']'],
        'severity': Severity.HIGH,
        'owasp': 'A02:2021'
    },
    'xss': {
        # Apenas innerHTML com concatenação de variáveis
        'patterns': [r'\.innerHTML\s*=\s*[^"\';\n]*\+'],
        'severity': Severity.HIGH,
        'owasp': 'A03:2021'
    },
}

# Benchmarks da indústria adaptados para GAS
INDUSTRY_BENCHMARKS = {
    'code_coverage': {'excellent': 80, 'good': 60, 'acceptable': 40},
    'documentation_ratio': {'excellent': 25, 'good': 15, 'acceptable': 10},
    'complexity_avg': {'excellent': 10, 'good': 15, 'acceptable': 25},
    'tech_debt_ratio': {'excellent': 5, 'good': 10, 'acceptable': 20},
    'test_ratio': {'excellent': 1.5, 'good': 1.0, 'acceptable': 0.5},
    'files_per_layer': {'excellent': 30, 'good': 50, 'acceptable': 80},
}

# Configuração padrão
DEFAULT_CONFIG = {
    'exclude_patterns': ['node_modules', '.git', 'dist', 'build', '__pycache__'],
    'file_extensions': {
        'code': ['.gs', '.js', '.ts'],
        'html': ['.html', '.htm', '.css'],
        'docs': ['.md', '.txt', '.json', '.yaml', '.yml'],
    },
    'thresholds': {
        'god_class_lines': 500,
        'long_method_lines': 50,
        'max_parameters': 5,
        'max_nesting': 4,
        'max_complexity': 20,
        'min_documentation_ratio': 10,
    },
    'weights': {cat.key: cat.weight for cat in AnalysisCategory},
    'history_file': '.epma_history.json',
}


# ============================================================================
# DATA CLASSES ENTERPRISE v5.0
# ============================================================================

@dataclass
class Issue:
    """Representa um issue identificado na análise."""
    id: str
    category: str
    severity: Severity
    title: str
    description: str
    file: Optional[str] = None
    line: Optional[int] = None
    recommendation: Optional[str] = None
    effort_hours: float = 1.0
    tags: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'category': self.category,
            'severity': self.severity.label,
            'title': self.title,
            'description': self.description,
            'file': self.file,
            'line': self.line,
            'recommendation': self.recommendation,
            'effort_hours': self.effort_hours,
            'tags': self.tags
        }


@dataclass
class FileMetrics:
    """Métricas detalhadas de um arquivo."""
    path: str
    extension: str = ""
    lines: int = 0
    code_lines: int = 0
    comment_lines: int = 0
    blank_lines: int = 0
    functions: int = 0
    classes: int = 0
    complexity: int = 0
    max_nesting: int = 0
    todos: int = 0
    fixmes: int = 0
    has_jsdoc: bool = False
    has_error_handling: bool = False
    has_logging: bool = False
    has_tests: bool = False
    gas_services: List[str] = field(default_factory=list)
    design_patterns: List[str] = field(default_factory=list)
    issues: List[Issue] = field(default_factory=list)
    hash: str = ""
    
    @property
    def comment_ratio(self) -> float:
        return (self.comment_lines / self.code_lines * 100) if self.code_lines > 0 else 0
    
    @property
    def maintainability_index(self) -> float:
        """Calcula índice de manutenibilidade (0-100)."""
        if self.code_lines == 0:
            return 100
        volume = self.code_lines * math.log2(max(1, self.functions + self.classes))
        mi = max(0, (171 - 5.2 * math.log(max(1, volume)) - 
                     0.23 * self.complexity - 
                     16.2 * math.log(max(1, self.code_lines))) * 100 / 171)
        return round(mi, 2)


@dataclass
class CategoryScore:
    """Pontuação detalhada de uma categoria."""
    category: AnalysisCategory
    score: float = 0.0
    max_score: float = 100.0
    metrics: Dict[str, Any] = field(default_factory=dict)
    issues: List[Issue] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    
    @property
    def percentage(self) -> float:
        return (self.score / self.max_score * 100) if self.max_score > 0 else 0
    
    @property
    def weighted_score(self) -> float:
        return self.percentage * self.category.weight
    
    @property
    def grade(self) -> str:
        pct = self.percentage
        if pct >= 90: return "A+"
        if pct >= 85: return "A"
        if pct >= 80: return "A-"
        if pct >= 75: return "B+"
        if pct >= 70: return "B"
        if pct >= 65: return "B-"
        if pct >= 60: return "C+"
        if pct >= 55: return "C"
        if pct >= 50: return "C-"
        if pct >= 45: return "D+"
        if pct >= 40: return "D"
        return "F"
    
    def to_dict(self) -> Dict:
        return {
            'category': self.category.label,
            'score': self.score,
            'max_score': self.max_score,
            'percentage': round(self.percentage, 1),
            'grade': self.grade,
            'weight': self.category.weight,
            'weighted_score': round(self.weighted_score, 2),
            'metrics': self.metrics,
            'issues_count': len(self.issues),
            'recommendations': self.recommendations,
        }


@dataclass
class LayerMetrics:
    """Métricas por camada arquitetural AE."""
    name: str
    files: List[str] = field(default_factory=list)
    total_lines: int = 0
    total_functions: int = 0
    avg_complexity: float = 0.0


@dataclass
class DomainMetrics:
    """Métricas por domínio de negócio."""
    name: str
    files: List[str] = field(default_factory=list)
    total_lines: int = 0
    workflows: int = 0
    validations: int = 0


@dataclass
class MaturityReport:
    """Relatório completo de maturidade enterprise v5.0 - UNIAE CRE."""
    # Metadados
    project_name: str
    project_path: str
    analysis_id: str
    analysis_date: str
    analysis_duration_seconds: float
    analyzer_version: str = __version__
    
    # Métricas gerais
    total_files: int = 0
    total_lines: int = 0
    total_code_lines: int = 0
    total_comment_lines: int = 0
    total_functions: int = 0
    total_classes: int = 0
    
    # Pontuações
    categories: Dict[str, CategoryScore] = field(default_factory=dict)
    overall_score: float = 0.0
    maturity_level: MaturityLevel = MaturityLevel.INITIAL
    
    # Issues e dívida técnica
    all_issues: List[Issue] = field(default_factory=list)
    tech_debt_hours: float = 0.0
    
    # Análises específicas AE
    architecture_patterns: List[str] = field(default_factory=list)
    design_patterns_found: Dict[str, int] = field(default_factory=dict)
    layer_metrics: Dict[str, LayerMetrics] = field(default_factory=dict)
    domain_metrics: Dict[str, DomainMetrics] = field(default_factory=dict)
    gas_services_used: Dict[str, int] = field(default_factory=dict)
    workflow_coverage: Dict[str, bool] = field(default_factory=dict)
    compliance_status: Dict[str, bool] = field(default_factory=dict)
    
    # Resumo executivo
    strengths: List[str] = field(default_factory=list)
    weaknesses: List[str] = field(default_factory=list)
    opportunities: List[str] = field(default_factory=list)
    action_items: List[Dict[str, Any]] = field(default_factory=list)
    
    @property
    def tech_debt_days(self) -> float:
        return self.tech_debt_hours / 8
    
    @property
    def issues_by_severity(self) -> Dict[str, int]:
        counter = Counter(i.severity.label for i in self.all_issues)
        return dict(counter)
    
    @property
    def health_score(self) -> str:
        if self.overall_score >= 80:
            return "🟢 Saudável"
        elif self.overall_score >= 60:
            return "🟡 Atenção"
        elif self.overall_score >= 40:
            return "🟠 Em Risco"
        return "🔴 Crítico"
    
    @property
    def quality_gate_status(self) -> str:
        critical_issues = sum(1 for i in self.all_issues if i.severity == Severity.CRITICAL)
        if critical_issues > 0:
            return "❌ FAILED - Issues críticos"
        if self.overall_score < 50:
            return "❌ FAILED - Score baixo"
        if self.overall_score < 70:
            return "⚠️ WARNING - Melhorias necessárias"
        return "✅ PASSED"


# ============================================================================
# ANALISADORES ESPECIALIZADOS ENTERPRISE v5.0 - UNIAE CRE
# ============================================================================

class BaseAnalyzer(ABC):
    """Classe base para analisadores."""
    
    def __init__(self, project_path: Path, files: Dict[str, FileMetrics]):
        self.project_path = project_path
        self.files = files
        self.gs_files = {k: v for k, v in files.items() 
                        if v.extension in {'.gs', '.js', '.ts'}}
        self.html_files = {k: v for k, v in files.items() 
                         if v.extension in {'.html', '.htm', '.css'}}
        self.issues: List[Issue] = []
        
    @abstractmethod
    def analyze(self) -> CategoryScore:
        """Executa análise e retorna pontuação."""
        pass
    
    def _create_issue(self, category: str, severity: Severity, title: str,
                     description: str, **kwargs) -> Issue:
        """Cria um issue padronizado."""
        issue_id = hashlib.md5(f"{category}{title}{kwargs.get('file', '')}".encode()).hexdigest()[:8]
        issue = Issue(
            id=issue_id,
            category=category,
            severity=severity,
            title=title,
            description=description,
            **kwargs
        )
        self.issues.append(issue)
        return issue
    
    def _read_file_content(self, file_path: str) -> str:
        """Lê conteúdo de arquivo com tratamento de erros."""
        try:
            return Path(file_path).read_text(encoding='utf-8', errors='ignore')
        except:
            return ""


class ArchitectureAnalyzer(BaseAnalyzer):
    """Analisa arquitetura do projeto UNIAE CRE com métricas específicas."""
    
    LAYER_PATTERNS = {
        'core': (r'^Core_', 'Núcleo/Core - Serviços fundamentais'),
        'domain': (r'^Dominio_', 'Domínio - Lógica de negócio'),
        'infrastructure': (r'^Infra_', 'Infraestrutura - Serviços técnicos'),
        'ui': (r'^UI_', 'Interface - Componentes visuais'),
        'setup': (r'^Setup_', 'Configuração - Scripts de setup'),
        'test': (r'^Test_', 'Testes - Suítes de teste'),
        'bootstrap': (r'^(_|0_|1_)', 'Bootstrap & Docs - Inicialização'),
        'styles': (r'^(Styles_|UX_)', 'Estilos/UX - Design System'),
    }
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.ARCHITECTURE)
        
        # Executa todas as análises primeiro
        layers = self._analyze_layers()
        patterns = self._detect_architecture_patterns()
        modularity = self._analyze_modularity()
        coupling = self._analyze_coupling()
        cohesion = self._analyze_cohesion()
        refactoring = self._analyze_refactoring_progress()
        god_classes = self._analyze_god_classes()
        
        score.metrics = {
            'layers': layers,
            'architecture_patterns': patterns,
            'modularity': modularity,
            'coupling': coupling,
            'cohesion': cohesion,
            'refactoring': refactoring,
            'god_classes': god_classes,
        }
        
        # Cálculo de pontuação (max 100)
        layer_score = min(20, len(layers['identified']) * 3)
        pattern_score = min(15, len(patterns) * 3)
        modularity_score = modularity['score']
        coupling_score = coupling['score']
        cohesion_score = cohesion['score']
        refactoring_score = refactoring['score']
        
        # Penalidade por god classes (arquivos muito grandes)
        god_class_penalty = min(15, god_classes['count'] * 1)
        
        score.score = max(0, layer_score + pattern_score + modularity_score + coupling_score + cohesion_score + refactoring_score - god_class_penalty)
        
        if len(layers['identified']) >= 6:
            score.recommendations.append("✓ Excelente separação em camadas arquiteturais AE")
        if len(patterns) >= 5:
            score.recommendations.append("✓ Múltiplos padrões arquiteturais implementados")
        if refactoring['progress_percentage'] >= 80:
            score.recommendations.append("✓ Alta adesão ao padrão de arquitetura (Refactoring > 80%)")
        if coupling['avg'] > 15:
            score.recommendations.append("Considere reduzir acoplamento entre módulos")
        if god_classes['count'] > 5:
            score.recommendations.append(f"⚠️ {god_classes['count']} arquivos excedem 1000 linhas - considere refatorar")
        
        score.issues = self.issues
        return score
    
    def _analyze_god_classes(self) -> Dict:
        """Analisa arquivos muito grandes (god classes)."""
        GOD_CLASS_THRESHOLD = 1000
        god_classes = []
        
        for file_path, metrics in self.gs_files.items():
            filename = Path(file_path).name
            # Ignora arquivos de setup/teste/docs
            if any(skip in filename for skip in ['Setup_', 'Test_', '_DOCS_', '_DIAGNOSTIC', '_AUDIT_']):
                continue
            if metrics.code_lines > GOD_CLASS_THRESHOLD:
                god_classes.append({
                    'file': filename,
                    'lines': metrics.code_lines,
                    'functions': metrics.functions
                })
        
        return {
            'count': len(god_classes),
            'files': sorted(god_classes, key=lambda x: x['lines'], reverse=True)[:10],
            'threshold': GOD_CLASS_THRESHOLD
        }

    def _analyze_refactoring_progress(self) -> Dict:
        """Analisa progresso da refatoração para arquitetura Core/Dominio/Infra."""
        total_gs = len(self.gs_files)
        if total_gs == 0:
            return {'progress': 0, 'score': 0}
            
        refactored = 0
        legacy = 0
        
        # Prefixes standard definidos no projeto
        standard_prefixes = ('Core_', 'Dominio_', 'Infra_', 'UI_', 'Setup_', 'Test_', '_', 'Ajustes_', 'Validacoes_')
        
        for filename in self.gs_files.keys():
            name = Path(filename).name
            if name.startswith(standard_prefixes):
                refactored += 1
            else:
                legacy += 1
                
        progress = (refactored / total_gs) * 100
        
        # Score de refatoração (max 20 pontos da categoria Arquitetura)
        score = min(20, progress * 0.2)
        
        return {
            'refactored_files': refactored,
            'legacy_files': legacy,
            'progress_percentage': round(progress, 1),
            'score': round(score)
        }
    
    def _analyze_layers(self) -> Dict:
        """Analisa camadas arquiteturais AE."""
        layers = defaultdict(list)
        layer_metrics = {}
        
        for file_path, metrics in self.files.items():
            filename = Path(file_path).name
            for layer_key, (pattern, label) in self.LAYER_PATTERNS.items():
                if re.match(pattern, filename):
                    layers[layer_key].append(filename)
                    if layer_key not in layer_metrics:
                        layer_metrics[layer_key] = LayerMetrics(name=label)
                    layer_metrics[layer_key].files.append(filename)
                    layer_metrics[layer_key].total_lines += metrics.code_lines
                    layer_metrics[layer_key].total_functions += metrics.functions
                    break
        
        return {
            'identified': list(layers.keys()),
            'distribution': {k: len(v) for k, v in layers.items()},
            'files_by_layer': dict(layers),
            'total_organized': sum(len(v) for v in layers.values()),
            'organization_percentage': round(
                sum(len(v) for v in layers.values()) / max(1, len(self.files)) * 100, 1
            )
        }
    
    def _detect_architecture_patterns(self) -> List[str]:
        """Detecta padrões arquiteturais AE."""
        detected = []
        all_content = ""
        
        for file_path in self.gs_files.keys():
            all_content += self._read_file_content(file_path).lower()
        
        for pattern_name, regex in ARCHITECTURE_PATTERNS_AE.items():
            matches = len(re.findall(regex, all_content, re.I))
            if matches >= 3:
                detected.append(pattern_name)
        
        return detected
    
    def _analyze_modularity(self) -> Dict:
        """Analisa modularidade do código."""
        if not self.gs_files:
            return {'avg_functions': 0, 'score': 0}
        
        total_functions = sum(m.functions for m in self.gs_files.values())
        files_with_code = len([f for f in self.gs_files.values() if f.functions > 0])
        
        avg = total_functions / files_with_code if files_with_code > 0 else 0
        
        if 5 <= avg <= 15:
            mod_score = 20
        elif 3 <= avg <= 20:
            mod_score = 15
        elif avg > 0:
            mod_score = 10
        else:
            mod_score = 5
        
        return {'avg_functions': round(avg, 1), 'total_functions': total_functions, 'score': mod_score}
    
    def _analyze_coupling(self) -> Dict:
        """Analisa acoplamento entre módulos."""
        coupling_data = []
        
        for file_path, metrics in self.gs_files.items():
            content = self._read_file_content(file_path)
            refs = len(re.findall(r'\b(Core_|Dominio_|Infra_|UI_|Setup_|UX_)\w+', content))
            coupling_data.append(refs)
        
        avg = statistics.mean(coupling_data) if coupling_data else 0
        
        if 5 <= avg <= 12:
            coup_score = 20
        elif avg < 5:
            coup_score = 15
        elif avg <= 20:
            coup_score = 12
        else:
            coup_score = 8
        
        return {'avg': round(avg, 1), 'max': max(coupling_data) if coupling_data else 0, 'score': coup_score}
    
    def _analyze_cohesion(self) -> Dict:
        """Analisa coesão dos módulos."""
        cohesion_scores = []
        
        for file_path, metrics in self.gs_files.items():
            if metrics.functions == 0:
                continue
            
            filename = Path(file_path).stem
            has_prefix = bool(re.match(r'^[A-Z][a-z]+_', filename))
            func_density = metrics.functions / max(1, metrics.code_lines) * 100
            
            file_cohesion = 50
            if has_prefix:
                file_cohesion += 25
            if 0.5 <= func_density <= 5:
                file_cohesion += 25
            
            cohesion_scores.append(file_cohesion)
        
        avg = statistics.mean(cohesion_scores) if cohesion_scores else 50
        score = min(15, avg * 0.15)
        
        return {'avg': round(avg, 1), 'score': round(score)}


class CodeQualityAnalyzer(BaseAnalyzer):
    """Analisa qualidade de código com métricas avançadas."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.CODE_QUALITY)
        
        complexity = self._analyze_complexity()
        error_handling = self._analyze_error_handling()
        code_smells = self._detect_code_smells()
        best_practices = self._check_best_practices()
        design_patterns = self._detect_design_patterns()
        module_structure = self._check_module_structure()
        
        score.metrics = {
            'complexity': complexity,
            'error_handling': error_handling,
            'code_smells': code_smells,
            'best_practices': best_practices,
            'design_patterns': design_patterns,
            'module_structure': module_structure,
        }
        
        score.score = complexity['score'] + error_handling['score'] + \
                     code_smells['score'] + best_practices['score'] + \
                     design_patterns['score'] + module_structure['score']
        
        if complexity['avg'] > 25:
            score.recommendations.append("Refatore funções complexas em unidades menores")
        if error_handling['percentage'] < 60:
            score.recommendations.append("Implemente tratamento de erros consistente")
        if design_patterns['count'] >= 8:
            score.recommendations.append("✓ Excelente uso de padrões de design")
        
        score.issues = self.issues
        return score
    
    def _analyze_complexity(self) -> Dict:
        """Analisa complexidade ciclomática (ajustado para GAS)."""
        if not self.gs_files:
            return {'avg': 0, 'max': 0, 'score': 0}
        
        complexities = [m.complexity for m in self.gs_files.values()]
        
        # Coleta arquivos com alta complexidade
        high_complexity_files = []
        for file_path, metrics in self.gs_files.items():
            if metrics.complexity > 60:
                high_complexity_files.append({
                    'file': Path(file_path).name,
                    'complexity': metrics.complexity,
                    'functions': metrics.functions
                })
        high_complexity_files.sort(key=lambda x: x['complexity'], reverse=True)
        
        avg = statistics.mean(complexities)
        avg = statistics.mean(complexities)
        
        # GAS tende a ter complexidade maior devido à natureza do código
        if avg <= 20:
            comp_score = 25
        elif avg <= 35:
            comp_score = 22
        elif avg <= 50:
            comp_score = 18
        elif avg <= 70:
            comp_score = 14
        else:
            comp_score = 10
        
        return {
            'avg': round(avg, 1),
            'max': max(complexities),
            'median': round(statistics.median(complexities), 1),
            'high_complexity_files': high_complexity_files[:10],
            'score': comp_score
        }
    
    def _analyze_error_handling(self) -> Dict:
        """Analisa tratamento de erros."""
        if not self.gs_files:
            return {'count': 0, 'percentage': 0, 'score': 0}
        
        with_handling = sum(1 for m in self.gs_files.values() if m.has_error_handling)
        percentage = (with_handling / len(self.gs_files)) * 100
        score = min(20, percentage * 0.2)
        
        return {
            'count': with_handling,
            'total': len(self.gs_files),
            'percentage': round(percentage, 1),
            'score': round(score)
        }
    
    def _detect_code_smells(self) -> Dict:
        """Detecta code smells (com thresholds ajustados para GAS)."""
        smells = []
        
        # Thresholds mais realistas para projetos GAS enterprise
        GOD_CLASS_THRESHOLD = 1000  # Updated to match project definition (was 800)
        TOO_MANY_FUNCTIONS_THRESHOLD = 50
        EXCESSIVE_TODOS_THRESHOLD = 10
        
        for file_path, metrics in self.gs_files.items():
            filename = Path(file_path).name
            
            # Ignora arquivos de setup/teste para god_class
            if not any(skip in filename for skip in ['Setup_', 'Test_', '_DOCS_']):
                if metrics.code_lines > GOD_CLASS_THRESHOLD:
                    smells.append({'type': 'god_class', 'file': filename, 'detail': f'{metrics.code_lines} linhas'})
            
            if metrics.functions > TOO_MANY_FUNCTIONS_THRESHOLD:
                smells.append({'type': 'too_many_functions', 'file': filename, 'detail': f'{metrics.functions} funções'})
            
            if metrics.todos + metrics.fixmes > EXCESSIVE_TODOS_THRESHOLD:
                smells.append({'type': 'excessive_todos', 'file': filename, 'detail': f'{metrics.todos + metrics.fixmes} pendências'})
        
        # Score mais generoso - penaliza menos
        score = max(0, 20 - len(smells) * 0.5)
        
        return {
            'count': len(smells),
            'items': smells[:20],
            'by_type': dict(Counter(s['type'] for s in smells)),
            'score': round(score)
        }
    
    def _check_best_practices(self) -> Dict:
        """Verifica boas práticas."""
        practices = {'jsdoc': 0, 'logging': 0, 'constants': 0, 'strict_mode': 0}
        
        for file_path, metrics in self.gs_files.items():
            if metrics.has_jsdoc:
                practices['jsdoc'] += 1
            if metrics.has_logging:
                practices['logging'] += 1
            
            content = self._read_file_content(file_path)
            if "'use strict'" in content or '"use strict"' in content:
                practices['strict_mode'] += 1
        
        practices['constants'] = sum(1 for f in self.gs_files.keys() 
                                    if 'constant' in f.lower() or 'config' in f.lower())

        total = len(self.gs_files) if self.gs_files else 1
        jsdoc_pct = (practices['jsdoc'] / total) * 100
        logging_pct = (practices['logging'] / total) * 100
        
        score = min(20, (jsdoc_pct * 0.1) + (logging_pct * 0.05) + 
                   (5 if practices['constants'] > 0 else 0))
        
        return {
            'jsdoc_percentage': round(jsdoc_pct, 1),
            'logging_percentage': round(logging_pct, 1),
            'has_constants': practices['constants'] > 0,
            'strict_mode_count': practices['strict_mode'],
            'score': round(score)
        }
    
    def _detect_design_patterns(self) -> Dict:
        """Detecta padrões de design."""
        patterns_found = defaultdict(int)
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            for pattern_name, regex in ARCHITECTURE_PATTERNS_AE.items():
                if re.search(regex, content, re.I):
                    patterns_found[pattern_name] += 1
        
        score = min(15, len(patterns_found) * 2)
        
        return {
            'patterns': dict(patterns_found),
            'count': len(patterns_found),
            'score': round(score)
        }

    def _check_module_structure(self) -> Dict:
        """Verifica estrutura de módulos (IIFE Pattern) conforme padrão Enterprise."""
        iife_count = 0
        total_modules = 0
        
        # Arquivos que deveriam ser módulos (Core_, Dominio_, Infra_, etc)
        target_prefixes = ('Core_', 'Dominio_', 'Infra_', 'UI_', 'Setup_')
        
        for f, m in self.gs_files.items():
            name = Path(f).name
            if name.startswith(target_prefixes) and not name.endswith('_Test.gs'):
                total_modules += 1
                content = self._read_file_content(f)
                # Padrão: var Module = (function() { ... })();
                if re.search(r'var\s+\w+\s*=\s*\(\s*function\s*\(\)\s*\{', content):
                    iife_count += 1
        
        percentage = (iife_count / total_modules * 100) if total_modules > 0 else 0
        
        # Pontuação extra para adoção do padrão
        score = min(10, percentage * 0.1)
        
        return {
            'iife_count': iife_count,
            'total_modules': total_modules,
            'percentage': round(percentage, 1),
            'score': round(score)
        }


class DocumentationAnalyzer(BaseAnalyzer):
    """Analisa documentação com métricas enterprise."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.DOCUMENTATION)
        
        readme = self._analyze_readme()
        api_docs = self._analyze_api_docs()
        inline_docs = self._analyze_inline_docs()
        architecture_docs = self._analyze_architecture_docs()
        
        score.metrics = {
            'readme': readme,
            'api_docs': api_docs,
            'inline_docs': inline_docs,
            'architecture_docs': architecture_docs,
        }
        
        score.score = readme['score'] + api_docs['score'] + inline_docs['score'] + architecture_docs['score']
        
        if readme['exists'] and readme['sections_found'] >= 5:
            score.recommendations.append("✓ README bem estruturado")
        if inline_docs['percentage'] >= 15:
            score.recommendations.append("✓ Boa cobertura de documentação inline")
        
        score.issues = self.issues
        return score
    
    def _analyze_readme(self) -> Dict:
        """Analisa README em detalhes."""
        readme_files = list(self.project_path.glob('README*'))
        
        if not readme_files:
            return {'exists': False, 'score': 0}
        
        readme_path = readme_files[0]
        content = readme_path.read_text(encoding='utf-8', errors='ignore')
        lines = len(content.split('\n'))
        
        sections = {
            'description': bool(re.search(r'^#\s+\w+', content, re.M)),
            'installation': bool(re.search(r'#.*install|instalação', content, re.I)),
            'usage': bool(re.search(r'#.*uso|usage|como usar', content, re.I)),
            'api': bool(re.search(r'#.*api', content, re.I)),
            'architecture': bool(re.search(r'#.*arquitetura|architecture', content, re.I)),
            'license': bool(re.search(r'#.*licen[çc]|license', content, re.I)),
        }
        
        size_score = min(10, lines / 20)
        section_score = sum(3 for v in sections.values() if v)
        
        return {
            'exists': True,
            'file': readme_path.name,
            'lines': lines,
            'sections': sections,
            'sections_found': sum(sections.values()),
            'score': round(min(30, size_score + section_score))
        }
    
    def _analyze_api_docs(self) -> Dict:
        """Analisa documentação de API."""
        api_files = []
        
        for pattern in ['*API*', '*api*', 'API_*.md']:
            api_files.extend(self.project_path.glob(pattern))
        
        api_files = [f for f in api_files if f.suffix in {'.md', '.json', '.yaml', '.yml'}]
        score = min(25, len(api_files) * 8)
        
        return {
            'files': [f.name for f in api_files[:10]],
            'count': len(api_files),
            'score': score
        }
    
    def _analyze_inline_docs(self) -> Dict:
        """Analisa documentação inline."""
        if not self.gs_files:
            return {'percentage': 0, 'score': 0}
        
        total_code = sum(m.code_lines for m in self.gs_files.values())
        total_comments = sum(m.comment_lines for m in self.gs_files.values())
        
        if total_code == 0:
            return {'percentage': 0, 'score': 0}
        
        percentage = (total_comments / total_code) * 100
        
        if 15 <= percentage <= 30:
            doc_score = 25
        elif 10 <= percentage <= 40:
            doc_score = 20
        elif percentage > 5:
            doc_score = 15
        else:
            doc_score = 8
        
        return {
            'comment_lines': total_comments,
            'code_lines': total_code,
            'percentage': round(percentage, 1),
            'score': doc_score
        }
    
    def _analyze_architecture_docs(self) -> Dict:
        """Analisa documentação de arquitetura."""
        arch_patterns = ['ARCHITECTURE*', '*architecture*', 'DESIGN*']
        arch_files = []
        
        for pattern in arch_patterns:
            arch_files.extend(self.project_path.glob(pattern))
        
        score = min(20, len(arch_files) * 10)
        
        return {
            'files': [f.name for f in arch_files],
            'count': len(arch_files),
            'score': score
        }


class TestingAnalyzer(BaseAnalyzer):
    """Analisa testes com métricas enterprise."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.TESTING)
        
        test_files = self._identify_test_files()
        coverage = self._estimate_coverage(test_files)
        quality = self._analyze_test_quality(test_files)
        types = self._identify_test_types(test_files)
        
        score.metrics = {
            'test_files': test_files,
            'coverage': coverage,
            'quality': quality,
            'types': types,
        }
        
        score.score = coverage['score'] + quality['score'] + types['score']
        
        if test_files['count'] >= 10:
            score.recommendations.append("✓ Boa quantidade de arquivos de teste")
        if coverage['percentage'] < 40:
            score.recommendations.append("Aumente a cobertura de testes")
        
        score.issues = self.issues
        return score
    
    def _identify_test_files(self) -> Dict:
        """Identifica arquivos de teste (mais preciso)."""
        # Apenas arquivos que são claramente de teste
        test_files = [f for f in self.files.keys() 
                     if Path(f).name.startswith('Test_') or 
                        Path(f).name.endswith('_Test.gs') or
                        'spec' in Path(f).name.lower()]
        
        test_lines = sum(self.files[f].code_lines for f in test_files if f in self.files)
        
        return {
            'files': [Path(f).name for f in test_files],
            'count': len(test_files),
            'total_lines': test_lines
        }
    
    def _estimate_coverage(self, test_files: Dict) -> Dict:
        """Estima cobertura de testes (mais realista para GAS)."""
        # Arquivos fonte (exclui test, setup, docs)
        source_files = [f for f in self.gs_files.keys() 
                       if not any(skip in f for skip in ['Test_', 'Setup_', '_DOCS_', '_DIAGNOSTIC', '_INIT_', '_AUDIT_', '_FINAL_'])]
        
        total = len(source_files)
        tested = test_files['count']
        
        if total == 0:
            return {'percentage': 0, 'score': 0}
        
        # Ratio mais realista - cada arquivo de teste cobre ~3 arquivos fonte
        effective_coverage = min(100, (tested / total) * 100 * 3)
        
        # Score baseado na cobertura efetiva
        if effective_coverage >= 80:
            score = 40
        elif effective_coverage >= 60:
            score = 35
        elif effective_coverage >= 40:
            score = 28
        elif effective_coverage >= 20:
            score = 20
        else:
            score = 12
        
        return {
            'source_files': total,
            'test_files': tested,
            'ratio': round(tested / total, 2) if total > 0 else 0,
            'percentage': round(effective_coverage, 1),
            'score': score
        }
    
    def _analyze_test_quality(self, test_files: Dict) -> Dict:
        """Analisa qualidade dos testes."""
        total_assertions = 0
        total_tests = 0
        
        for file_path in self.files.keys():
            if 'test' not in Path(file_path).name.lower():
                continue
            
            content = self._read_file_content(file_path)
            assertions = len(re.findall(
                r'(assert|expect|should|assertEqual|assertTrue|assertFalse|toBe|toEqual)',
                content, re.I))
            tests = len(re.findall(
                r'(function\s+test|it\s*\(|describe\s*\(|test\s*\()',
                content, re.I))
            
            total_assertions += assertions
            total_tests += max(1, tests)
        
        avg_assertions = total_assertions / total_tests if total_tests > 0 else 0
        score = min(30, avg_assertions * 5)
        
        return {
            'total_assertions': total_assertions,
            'total_tests': total_tests,
            'assertions_per_test': round(avg_assertions, 1),
            'score': round(score)
        }
    
    def _identify_test_types(self, test_files: Dict) -> Dict:
        """Identifica tipos de testes."""
        types = {'unit': False, 'integration': False, 'e2e': False, 'security': False}
        
        for filename in test_files['files']:
            lower = filename.lower()
            if 'unit' in lower:
                types['unit'] = True
            if 'integration' in lower or 'integ' in lower:
                types['integration'] = True
            if 'e2e' in lower or 'end' in lower:
                types['e2e'] = True
            if 'security' in lower or 'sec' in lower:
                types['security'] = True
        
        if test_files['count'] > 0 and not any(types.values()):
            types['unit'] = True
        
        score = sum(8 for v in types.values() if v)
        
        return {**types, 'types_count': sum(types.values()), 'score': min(30, score)}


class SecurityAnalyzer(BaseAnalyzer):
    """Analisa segurança com verificações OWASP."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.SECURITY)
        
        vulnerabilities = self._scan_vulnerabilities()
        auth = self._analyze_authentication()
        validation = self._analyze_input_validation()
        xss_protection = self._check_xss_protection()
        
        score.metrics = {
            'vulnerabilities': vulnerabilities,
            'authentication': auth,
            'input_validation': validation,
            'xss_protection': xss_protection,
        }
        
        # Calcula score baseado em boas práticas encontradas
        bonus = auth['score'] + validation['score'] + xss_protection['score']
        
        # Penalidade por vulnerabilidades (mais branda)
        vuln_penalty = min(30, vulnerabilities['critical'] * 5 + vulnerabilities['high'] * 2)
        
        score.score = max(0, min(100, bonus - vuln_penalty))
        
        if auth['has_auth']:
            score.recommendations.append("✓ Sistema de autenticação implementado")
        if validation['percentage'] >= 70:
            score.recommendations.append("✓ Boa cobertura de validação de entrada")
        
        score.issues = self.issues
        return score
    
    def _scan_vulnerabilities(self) -> Dict:
        """Escaneia vulnerabilidades OWASP (ignora arquivos de teste e docs)."""
        findings = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0, 'details': []}
        
        # Ignora arquivos de teste e documentação
        skip_patterns = ['Test_', 'test_', '_DOCS_', '_DIAGNOSTIC', 'Setup_']
        
        for file_path in self.gs_files.keys():
            filename = Path(file_path).name
            
            # Pula arquivos de teste/docs
            if any(skip in filename for skip in skip_patterns):
                continue
            
            content = self._read_file_content(file_path)
            
            for vuln_name, config in SECURITY_VULNERABILITIES.items():
                for pattern in config['patterns']:
                    matches = re.findall(pattern, content, re.I)
                    if matches:
                        sev = config['severity']
                        if sev == Severity.CRITICAL:
                            findings['critical'] += 1
                        elif sev == Severity.HIGH:
                            findings['high'] += 1
                        elif sev == Severity.MEDIUM:
                            findings['medium'] += 1
                        else:
                            findings['low'] += 1
                        
                        findings['details'].append({
                            'type': vuln_name,
                            'file': filename,
                            'owasp': config.get('owasp', 'N/A')
                        })
        
        return findings
    
    def _analyze_authentication(self) -> Dict:
        """Analisa sistema de autenticação."""
        auth_patterns = 0
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            auth_patterns += len(re.findall(
                r'(Auth|authenticate|login|session|token|permission|role|Session_Manager)',
                content, re.I))
        
        has_auth = auth_patterns > 10
        score = 25 if has_auth else 5
        
        return {
            'auth_patterns': auth_patterns,
            'has_auth': has_auth,
            'score': score
        }
    
    def _analyze_input_validation(self) -> Dict:
        """Analisa validação de entrada."""
        validation_patterns = 0
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            validation_patterns += len(re.findall(
                r'(validar|validate|sanitize|escape|Validation_|Validator_)',
                content, re.I))
        
        percentage = min(100, validation_patterns * 2)
        score = min(25, percentage * 0.25)
        
        return {
            'validation_patterns': validation_patterns,
            'percentage': percentage,
            'score': round(score)
        }
    
    def _check_xss_protection(self) -> Dict:
        """Verifica proteção XSS."""
        xss_protection = 0
        
        for file_path in list(self.gs_files.keys()) + list(self.html_files.keys()):
            content = self._read_file_content(file_path)
            xss_protection += len(re.findall(r'(escapeHtml|sanitize|DOMPurify|textContent|XSS_Protection)', content, re.I))
        
        has_protection = xss_protection > 3
        score = 25 if has_protection else 10
        
        return {
            'protection_patterns': xss_protection,
            'has_protection': has_protection,
            'score': score
        }


class MaintainabilityAnalyzer(BaseAnalyzer):
    """Analisa manutenibilidade com métricas avançadas."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.MAINTAINABILITY)
        
        file_size = self._analyze_file_sizes()
        duplication = self._estimate_duplication()
        tech_debt = self._estimate_tech_debt()
        
        score.metrics = {
            'file_size': file_size,
            'duplication': duplication,
            'tech_debt': tech_debt,
        }
        
        score.score = file_size['score'] + duplication['score'] + tech_debt['score']
        
        if file_size['avg'] <= 200:
            score.recommendations.append("✓ Tamanho médio de arquivos adequado")
        if tech_debt['hours'] > 100:
            score.recommendations.append(f"Planeje redução de dívida técnica ({tech_debt['hours']:.0f}h)")
        
        score.issues = self.issues
        return score
    
    def _analyze_file_sizes(self) -> Dict:
        """Analisa tamanho dos arquivos (ajustado para GAS)."""
        sizes = [m.code_lines for m in self.gs_files.values()]
        
        if not sizes:
            return {'avg': 0, 'max': 0, 'large_files': 0, 'score': 0}
        
        avg = statistics.mean(sizes)
        # Threshold mais realista para GAS (arquivos tendem a ser maiores)
        large_files = sum(1 for s in sizes if s > 600)
        
        # Score baseado em média (GAS permite arquivos maiores)
        if avg <= 300:
            size_score = 35
        elif avg <= 500:
            size_score = 30
        elif avg <= 700:
            size_score = 25
        else:
            size_score = 20
        
        return {
            'avg': round(avg, 1),
            'median': round(statistics.median(sizes), 1),
            'max': max(sizes),
            'large_files': large_files,
            'score': size_score
        }
    
    def _estimate_duplication(self) -> Dict:
        """Estima duplicação de código."""
        filenames = [Path(f).stem for f in self.gs_files.keys()]
        
        version_patterns = sum(1 for f in filenames 
                              if re.search(r'(_v\d|_Enhanced|_Fixed|_New|_Old|_Backup)', f))
        
        similar_groups = defaultdict(list)
        for f in filenames:
            base = re.sub(r'(_v\d|_Enhanced|_Fixed|_New|_Old|\d+)', '', f)
            similar_groups[base].append(f)
        
        duplicates = sum(len(v) - 1 for v in similar_groups.values() if len(v) > 1)
        percentage = (duplicates / len(filenames) * 100) if filenames else 0
        score = max(0, 35 - percentage * 0.7)
        
        return {
            'version_patterns': version_patterns,
            'similar_files': duplicates,
            'percentage': round(percentage, 1),
            'score': round(score)
        }
    
    def _estimate_tech_debt(self) -> Dict:
        """Estima dívida técnica (ajustado para projetos GAS enterprise)."""
        todos = sum(m.todos for m in self.gs_files.values())
        fixmes = sum(m.fixmes for m in self.gs_files.values())
        undocumented = sum(1 for m in self.gs_files.values() if not m.has_jsdoc)
        
        # Thresholds mais realistas para GAS
        complex_files = sum(1 for m in self.gs_files.values() if m.complexity > 50)
        large_files = sum(1 for m in self.gs_files.values() if m.code_lines > 800)
        
        # Coleta TODOs por arquivo para análise detalhada
        todos_by_file = []
        for file_path, metrics in self.gs_files.items():
            if metrics.todos > 5:
                todos_by_file.append({
                    'file': Path(file_path).name,
                    'todos': metrics.todos
                })
        todos_by_file.sort(key=lambda x: x['todos'], reverse=True)
        
        # Cálculo de horas mais realista
        hours = (todos * 0.25) + (fixmes * 0.5) + (undocumented * 0.1) + \
               (complex_files * 2) + (large_files * 1.5)
        
        # Score baseado em proporção, não valor absoluto
        total_files = len(self.gs_files)
        debt_ratio = hours / max(1, total_files)
        
        if debt_ratio <= 1:
            score = 30
        elif debt_ratio <= 2:
            score = 25
        elif debt_ratio <= 3:
            score = 20
        elif debt_ratio <= 5:
            score = 15
        else:
            score = 10
        
        return {
            'todos': todos,
            'fixmes': fixmes,
            'undocumented_files': undocumented,
            'complex_files': complex_files,
            'large_files': large_files,
            'hours': round(hours, 1),
            'days': round(hours / 8, 1),
            'debt_ratio': round(debt_ratio, 2),
            'todos_by_file': todos_by_file[:10],
            'score': round(score)
        }


class PerformanceAnalyzer(BaseAnalyzer):
    """Analisa aspectos de performance GAS."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.PERFORMANCE)
        
        caching = self._analyze_caching()
        batch_ops = self._analyze_batch_operations()
        optimization = self._analyze_optimization_patterns()
        
        score.metrics = {
            'caching': caching,
            'batch_operations': batch_ops,
            'optimization': optimization,
        }
        
        score.score = caching['score'] + batch_ops['score'] + optimization['score']
        
        if caching['has_caching']:
            score.recommendations.append("✓ Sistema de cache implementado")
        if batch_ops['has_batch']:
            score.recommendations.append("✓ Operações em lote implementadas")
        
        score.issues = self.issues
        return score
    
    def _analyze_caching(self) -> Dict:
        """Analisa uso de cache."""
        cache_patterns = 0
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            cache_patterns += len(re.findall(
                r'(CacheService|cache|memoize|Cache_|Smart_Cache|DataCache|Unified_Cache)',
                content, re.I))
        
        has_caching = cache_patterns > 5
        score = 35 if has_caching else 15
        
        return {
            'cache_patterns': cache_patterns,
            'has_caching': has_caching,
            'score': score
        }
    
    def _analyze_batch_operations(self) -> Dict:
        """Analisa operações em lote."""
        batch_count = 0
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            batch_count += len(re.findall(r'(getValues|setValues|getRangeList|batchUpdate|Batch_Operations)', content))
        
        has_batch = batch_count > 10
        score = 35 if has_batch else 15
        
        return {
            'batch_operations': batch_count,
            'has_batch': has_batch,
            'score': score
        }
    
    def _analyze_optimization_patterns(self) -> Dict:
        """Analisa padrões de otimização."""
        patterns = {'batch_operations': 0, 'lazy_loading': 0, 'quota_management': 0}
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            patterns['batch_operations'] += len(re.findall(r'(batch|bulk|getValues|setValues)', content, re.I))
            patterns['lazy_loading'] += len(re.findall(r'(lazy|defer|ondemand)', content, re.I))
            patterns['quota_management'] += len(re.findall(r'(quota|Quota_Manager|rate.?limit)', content, re.I))
        
        total = sum(patterns.values())
        score = min(30, total * 0.3)
        
        return {**patterns, 'total': total, 'score': round(score)}


class ReliabilityAnalyzer(BaseAnalyzer):
    """Analisa confiabilidade do sistema."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.RELIABILITY)
        
        error_handling = self._analyze_error_handling()
        logging = self._analyze_logging()
        retry_patterns = self._analyze_retry_patterns()
        
        score.metrics = {
            'error_handling': error_handling,
            'logging': logging,
            'retry_patterns': retry_patterns,
        }
        
        score.score = error_handling['score'] + logging['score'] + retry_patterns['score']
        
        if logging['structured']:
            score.recommendations.append("✓ Logging estruturado implementado")
        if retry_patterns['has_retry']:
            score.recommendations.append("✓ Padrões de retry implementados")
        
        score.issues = self.issues
        return score
    
    def _analyze_error_handling(self) -> Dict:
        """Analisa tratamento de erros."""
        with_try_catch = sum(1 for m in self.gs_files.values() if m.has_error_handling)
        total = len(self.gs_files)
        percentage = (with_try_catch / total * 100) if total > 0 else 0
        score = min(35, percentage * 0.35)
        
        return {
            'files_with_handling': with_try_catch,
            'total_files': total,
            'percentage': round(percentage, 1),
            'score': round(score)
        }
    
    def _analyze_logging(self) -> Dict:
        """Analisa sistema de logging."""
        with_logging = sum(1 for m in self.gs_files.values() if m.has_logging)
        structured = False
        correlation_id = False
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            if re.search(r'(Logger\.|log\.(info|error|warn|debug)|Production_Logger|AppLogger)', content):
                structured = True
            if re.search(r'(correlation|request_id|trace_id)', content, re.I):
                correlation_id = True
        
        score = min(35, with_logging * 0.5 + (10 if structured else 0) + (5 if correlation_id else 0))
        
        return {
            'files_with_logging': with_logging,
            'structured': structured,
            'correlation_id': correlation_id,
            'score': round(score)
        }
    
    def _analyze_retry_patterns(self) -> Dict:
        """Analisa padrões de retry."""
        retry_count = 0
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            retry_count += len(re.findall(r'(retry|attempt|backoff|Retry_|Resilience)', content, re.I))
        
        has_retry = retry_count > 3
        score = min(30, retry_count * 3)
        
        return {
            'retry_patterns': retry_count,
            'has_retry': has_retry,
            'score': round(score)
        }


class ScalabilityAnalyzer(BaseAnalyzer):
    """Analisa escalabilidade do sistema."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.SCALABILITY)
        
        modularity = self._analyze_modularity()
        batch_processing = self._analyze_batch_processing()
        
        score.metrics = {
            'modularity': modularity,
            'batch_processing': batch_processing,
        }
        
        score.score = modularity['score'] + batch_processing['score']
        score.issues = self.issues
        return score
    
    def _analyze_modularity(self) -> Dict:
        """Analisa modularidade para escalabilidade."""
        avg_size = statistics.mean([m.code_lines for m in self.gs_files.values()]) if self.gs_files else 0
        score = 50 if avg_size <= 200 else (35 if avg_size <= 400 else 20)
        
        return {
            'avg_file_size': round(avg_size, 1),
            'total_modules': len(self.gs_files),
            'score': score
        }
    
    def _analyze_batch_processing(self) -> Dict:
        """Analisa processamento em lote."""
        batch_patterns = 0
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            batch_patterns += len(re.findall(
                r'(batch|bulk|chunk|paginate|getValues|setValues)',
                content, re.I))
        
        has_batch = batch_patterns > 10
        score = 50 if has_batch else 25
        
        return {
            'batch_patterns': batch_patterns,
            'has_batch': has_batch,
            'score': score
        }


class DevOpsAnalyzer(BaseAnalyzer):
    """Analisa práticas DevOps e Clasp."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.DEVOPS)
        
        version_control = self._analyze_version_control()
        deployment = self._analyze_deployment()
        monitoring = self._analyze_monitoring()
        
        score.metrics = {
            'version_control': version_control,
            'deployment': deployment,
            'monitoring': monitoring,
        }
        
        score.score = version_control['score'] + deployment['score'] + monitoring['score']
        
        if version_control['has_clasp']:
            score.recommendations.append("✓ Clasp configurado para deploy")
        
        score.issues = self.issues
        return score
    
    def _analyze_version_control(self) -> Dict:
        """Analisa controle de versão."""
        has_git = (self.project_path / '.git').exists() or (self.project_path / '.gitignore').exists()
        has_clasp = (self.project_path / '.clasp.json').exists()
        
        score = 0
        if has_git:
            score += 25
        if has_clasp:
            score += 15
        
        return {'has_git': has_git, 'has_clasp': has_clasp, 'score': score}
    
    def _analyze_deployment(self) -> Dict:
        """Analisa configuração de deployment."""
        deploy_files = list(self.project_path.glob('*deploy*')) + list(self.project_path.glob('*.clasp*'))
        has_deploy_config = len(deploy_files) > 0
        score = 30 if has_deploy_config else 10
        
        return {'has_deploy_config': has_deploy_config, 'deploy_files': [f.name for f in deploy_files], 'score': score}
    
    def _analyze_monitoring(self) -> Dict:
        """Analisa monitoramento."""
        monitoring_patterns = 0
        
        for file_path in self.gs_files.keys():
            content = self._read_file_content(file_path)
            monitoring_patterns += len(re.findall(
                r'(monitor|metric|health|diagnostic|telemetry|Performance_|Health_Check)',
                content, re.I))
        
        has_monitoring = monitoring_patterns > 5
        score = 30 if has_monitoring else 10
        
        return {'monitoring_patterns': monitoring_patterns, 'has_monitoring': has_monitoring, 'score': score}


class OrganizationAnalyzer(BaseAnalyzer):
    """Analisa organização do projeto."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.ORGANIZATION)
        
        structure = self._analyze_structure()
        config = self._analyze_configuration()
        naming = self._analyze_naming_conventions()
        
        score.metrics = {
            'structure': structure,
            'configuration': config,
            'naming_conventions': naming,
        }
        
        score.score = structure['score'] + config['score'] + naming['score']
        
        if naming['consistency'] >= 80:
            score.recommendations.append("✓ Excelente consistência de nomenclatura AE")
        
        score.issues = self.issues
        return score
    
    def _analyze_structure(self) -> Dict:
        """Analisa estrutura de diretórios."""
        prefixes = defaultdict(int)
        
        for file_path in self.files.keys():
            filename = Path(file_path).name
            match = re.match(r'^([A-Z][a-z]+_|[A-Z]+_|_|0_|1_)', filename)
            if match:
                prefixes[match.group(1)] += 1
        
        score = min(35, len(prefixes) * 5)
        
        return {
            'prefixes': dict(prefixes),
            'prefix_count': len(prefixes),
            'organized_files': sum(prefixes.values()),
            'score': score
        }
    
    def _analyze_configuration(self) -> Dict:
        """Analisa arquivos de configuração."""
        config_files = []
        
        for pattern in ['*.json', 'appsscript.json', '.clasp*', '*config*']:
            config_files.extend(self.project_path.glob(pattern))
        
        config_files = list(set(config_files))
        score = min(35, len(config_files) * 7)
        
        return {'files': [f.name for f in config_files], 'count': len(config_files), 'score': score}
    
    def _analyze_naming_conventions(self) -> Dict:
        """Analisa convenções de nomenclatura AE."""
        total = len(self.files)
        if total == 0:
            return {'consistency': 0, 'score': 0}
        
        valid_prefixes = r'^(Core_|Dominio_|Infra_|UI_|Setup_|Test_|UX_|Styles_|_|0_|1_)'
        
        with_prefix = sum(1 for f in self.files.keys() 
                        if re.match(valid_prefixes, Path(f).name) or Path(f).suffix not in ['.gs'])
        
        consistency = (with_prefix / total) * 100
        score = min(30, consistency * 0.3)
        
        return {'with_prefix': with_prefix, 'total': total, 'consistency': round(consistency, 1), 'score': round(score)}


# ============================================================================
# ANALISADORES ESPECÍFICOS UNIAE CRE v5.0
# ============================================================================

class UXDesignAnalyzer(BaseAnalyzer):
    """Analisa UX e Design System AE com foco em Mobile First."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.UX_DESIGN)
        
        design_system = self._analyze_design_system()
        components = self._analyze_components()
        themes = self._analyze_themes()
        
        score.metrics = {
            'design_system': design_system,
            'components': components,
            'themes': themes,
        }
        
        score.score = design_system['score'] + components['score'] + themes['score']
        
        if design_system['has_ae_system']:
            score.recommendations.append("✓ AE Design System integrado")
        
        score.issues = self.issues
        return score

    def _analyze_design_system(self) -> Dict:
        has_ae_system = any('AE_Design_System' in f or 'design-system' in f for f in self.html_files)
        has_tokens = False
        
        for f in self.html_files:
            content = self._read_file_content(f)
            if 'var(--' in content or ':root' in content:
                has_tokens = True
                break
                
        score = 0
        if has_ae_system: score += 25
        if has_tokens: score += 15
        
        return {'has_ae_system': has_ae_system, 'has_tokens': has_tokens, 'score': min(40, score)}

    def _analyze_components(self) -> Dict:
        component_files = [f for f in self.html_files if 'Component' in f or 'Widget' in f or 'UI_' in f]
        score = min(30, len(component_files) * 2)
        return {'count': len(component_files), 'score': score}

    def _analyze_themes(self) -> Dict:
        theme_files = [f for f in self.html_files if 'Theme' in f or 'Styles_' in f]
        score = min(30, len(theme_files) * 5)
        return {'count': len(theme_files), 'score': score}


class BusinessLogicAnalyzer(BaseAnalyzer):
    """Analisa lógica de negócio (Domínios UNIAE CRE)."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.BUSINESS_LOGIC)
        
        domains = self._analyze_domains()
        rules = self._analyze_rules()
        validations = self._analyze_validations()
        
        score.metrics = {'domains': domains, 'rules': rules, 'validations': validations}
        score.score = domains['score'] + rules['score'] + validations['score']
        
        if domains['count'] >= 8:
            score.recommendations.append("✓ Domínios de negócio bem definidos")
        
        score.issues = self.issues
        return score

    def _analyze_domains(self) -> Dict:
        domain_files = [f for f in self.gs_files if 'Dominio_' in f]
        
        domains_found = []
        for domain_name, pattern in BUSINESS_DOMAINS_AE.items():
            for f in domain_files:
                if re.search(pattern, f, re.I):
                    domains_found.append(domain_name)
                    break
        
        score = min(40, len(domain_files) * 3)
        return {
            'count': len(domain_files), 
            'files': [Path(f).name for f in domain_files],
            'domains_covered': domains_found,
            'score': score
        }

    def _analyze_rules(self) -> Dict:
        rule_files = [f for f in self.gs_files if 'Validator' in f or 'Rules' in f or 'Business' in f]
        score = min(30, len(rule_files) * 4)
        return {'count': len(rule_files), 'files': [Path(f).name for f in rule_files], 'score': score}

    def _analyze_validations(self) -> Dict:
        validation_files = [f for f in self.gs_files if 'Validation' in f or 'Validacoes' in f]
        score = min(30, len(validation_files) * 5)
        return {'count': len(validation_files), 'files': [Path(f).name for f in validation_files], 'score': score}


class ComplianceAnalyzer(BaseAnalyzer):
    """Analisa Compliance e LGPD para sistema governamental."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.COMPLIANCE)
        
        legal_compliance = self._analyze_legal_compliance()
        data_protection = self._analyze_data_protection()
        audit_trail = self._analyze_audit_trail()
        
        score.metrics = {
            'legal_compliance': legal_compliance,
            'data_protection': data_protection,
            'audit_trail': audit_trail,
        }
        
        score.score = legal_compliance['score'] + data_protection['score'] + audit_trail['score']
        
        if audit_trail['has_audit']:
            score.recommendations.append("✓ Trilha de auditoria implementada")
        
        score.issues = self.issues
        return score

    def _analyze_legal_compliance(self) -> Dict:
        compliance_patterns = 0
        
        for f in self.gs_files:
            content = self._read_file_content(f)
            for pattern_name, pattern in COMPLIANCE_PATTERNS_BR.items():
                if re.search(pattern, content, re.I):
                    compliance_patterns += 1
        
        score = min(35, compliance_patterns * 2)
        return {'patterns_found': compliance_patterns, 'score': score}

    def _analyze_data_protection(self) -> Dict:
        protection_patterns = 0
        
        for f in self.gs_files:
            content = self._read_file_content(f)
            protection_patterns += len(re.findall(r'(encrypt|hash|sanitize|mask|Secure_)', content, re.I))
        
        has_protection = protection_patterns > 5
        score = 35 if has_protection else 15
        return {'patterns': protection_patterns, 'has_protection': has_protection, 'score': score}

    def _analyze_audit_trail(self) -> Dict:
        audit_patterns = 0
        
        for f in self.gs_files:
            content = self._read_file_content(f)
            audit_patterns += len(re.findall(r'(audit|Audit_|trail|history|log|Enterprise_Audit)', content, re.I))
        
        has_audit = audit_patterns > 10
        score = 30 if has_audit else 10
        return {'patterns': audit_patterns, 'has_audit': has_audit, 'score': score}


class AccessibilityAnalyzer(BaseAnalyzer):
    """Analisa Acessibilidade WCAG."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.ACCESSIBILITY)
        
        aria = self._analyze_aria()
        semantic = self._analyze_semantic_html()
        helpers = self._analyze_accessibility_helpers()
        
        score.metrics = {
            'aria': aria,
            'semantic': semantic,
            'helpers': helpers,
        }
        
        score.score = aria['score'] + semantic['score'] + helpers['score']
        
        if helpers['has_helpers']:
            score.recommendations.append("✓ Helpers de acessibilidade implementados")
        
        score.issues = self.issues
        return score

    def _analyze_aria(self) -> Dict:
        aria_count = 0
        
        for f in self.html_files:
            content = self._read_file_content(f)
            aria_count += len(re.findall(r'(aria-|role=)', content))
        
        score = min(35, aria_count * 0.5)
        return {'count': aria_count, 'score': round(score)}

    def _analyze_semantic_html(self) -> Dict:
        semantic_count = 0
        
        for f in self.html_files:
            content = self._read_file_content(f)
            semantic_count += len(re.findall(r'<(header|nav|main|article|section|aside|footer)', content))
        
        score = min(35, semantic_count * 2)
        return {'count': semantic_count, 'score': score}

    def _analyze_accessibility_helpers(self) -> Dict:
        has_helpers = any('Accessibility' in f for f in self.html_files)
        score = 30 if has_helpers else 10
        return {'has_helpers': has_helpers, 'score': score}


class WorkflowAtestoAnalyzer(BaseAnalyzer):
    """Analisa workflows de atesto específicos do UNIAE CRE."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.WORKFLOW_ATESTO)
        
        workflows = self._analyze_workflows()
        state_machine = self._analyze_state_machine()
        roles = self._analyze_roles()
        
        score.metrics = {
            'workflows': workflows,
            'state_machine': state_machine,
            'roles': roles,
        }
        
        score.score = workflows['score'] + state_machine['score'] + roles['score']
        
        if workflows['count'] >= 4:
            score.recommendations.append("✓ Workflows de atesto bem implementados")
        
        score.issues = self.issues
        return score

    def _analyze_workflows(self) -> Dict:
        workflow_files = [f for f in self.files if 'Workflow' in f or 'workflow' in f]
        
        workflows_found = []
        for wf_name, pattern in WORKFLOW_PATTERNS_AE.items():
            for f in workflow_files:
                if re.search(pattern, f, re.I):
                    workflows_found.append(wf_name)
                    break
        
        score = min(40, len(workflow_files) * 4)
        return {
            'count': len(workflow_files),
            'files': [Path(f).name for f in workflow_files],
            'workflows_covered': workflows_found,
            'score': score
        }

    def _analyze_state_machine(self) -> Dict:
        state_patterns = 0
        
        for f in self.gs_files:
            content = self._read_file_content(f)
            state_patterns += len(re.findall(r'(Status_|State|Transition|Pending|Approved|Rejected)', content))
        
        has_state_machine = state_patterns > 20
        score = 30 if has_state_machine else 15
        return {'patterns': state_patterns, 'has_state_machine': has_state_machine, 'score': score}

    def _analyze_roles(self) -> Dict:
        role_patterns = 0
        
        for f in self.gs_files:
            content = self._read_file_content(f)
            role_patterns += len(re.findall(r'(Analista|Fornecedor|Nutricionista|Representante|role|permission)', content, re.I))
        
        has_roles = role_patterns > 10
        score = 30 if has_roles else 15
        return {'patterns': role_patterns, 'has_roles': has_roles, 'score': score}


class GASIntegrationAnalyzer(BaseAnalyzer):
    """Analisa integração com serviços Google Apps Script."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.GAS_INTEGRATION)
        
        services = self._analyze_services()
        triggers = self._analyze_triggers()
        
        score.metrics = {
            'services': services,
            'triggers': triggers,
        }
        
        score.score = services['score'] + triggers['score']
        
        if services['count'] >= 8:
            score.recommendations.append("✓ Boa integração com serviços GAS")
        
        score.issues = self.issues
        return score

    def _analyze_services(self) -> Dict:
        services_used = defaultdict(int)
        
        for f in self.gs_files:
            content = self._read_file_content(f)
            for service_name, pattern in GAS_PATTERNS.items():
                count = len(re.findall(pattern, content))
                if count > 0:
                    services_used[service_name] += count
        
        score = min(60, len(services_used) * 5)
        return {
            'services': dict(services_used),
            'count': len(services_used),
            'score': score
        }

    def _analyze_triggers(self) -> Dict:
        trigger_count = 0
        
        for f in self.gs_files:
            content = self._read_file_content(f)
            trigger_count += len(re.findall(r'(onOpen|onEdit|onInstall|doGet|doPost|ScriptApp\.newTrigger)', content))
        
        has_triggers = trigger_count > 3
        score = 40 if has_triggers else 20
        return {'count': trigger_count, 'has_triggers': has_triggers, 'score': score}


class MobileFirstAnalyzer(BaseAnalyzer):
    """Analisa otimização Mobile First / S20."""
    
    def analyze(self) -> CategoryScore:
        score = CategoryScore(category=AnalysisCategory.MOBILE_FIRST)
        
        mobile_files = self._analyze_mobile_files()
        responsive = self._analyze_responsive()
        
        score.metrics = {
            'mobile_files': mobile_files,
            'responsive': responsive,
        }
        
        score.score = mobile_files['score'] + responsive['score']
        
        if mobile_files['count'] >= 5:
            score.recommendations.append("✓ Otimizado para Mobile (S20)")
        
        score.issues = self.issues
        return score

    def _analyze_mobile_files(self) -> Dict:
        mobile_files = [f for f in self.files if 'Mobile' in f or 'S20' in f or 'mobile' in f]
        score = min(50, len(mobile_files) * 5)
        return {'count': len(mobile_files), 'files': [Path(f).name for f in mobile_files], 'score': score}

    def _analyze_responsive(self) -> Dict:
        responsive_count = 0
        
        for f in self.html_files:
            content = self._read_file_content(f)
            responsive_count += len(re.findall(r'(@media|viewport|responsive|width=device-width)', content))
        
        has_responsive = responsive_count > 10
        score = 50 if has_responsive else 25
        return {'patterns': responsive_count, 'has_responsive': has_responsive, 'score': score}


# ============================================================================
# FILE SCANNER E ORQUESTRADOR
# ============================================================================

class FileScanner:
    """Escaneia arquivos e gera métricas básicas."""
    
    def scan(self, project_path: Path) -> Dict[str, FileMetrics]:
        files = {}
        for file_path in project_path.rglob('*'):
            if file_path.is_file() and not any(p in str(file_path) for p in ['.git', 'node_modules', '__pycache__']):
                ext = file_path.suffix
                if ext in ['.gs', '.js', '.ts', '.html', '.css', '.md']:
                    try:
                        content = file_path.read_text(encoding='utf-8', errors='ignore')
                        metrics = self._analyze_file(str(file_path), content)
                        files[str(file_path)] = metrics
                    except Exception:
                        pass
        return files
    
    def _analyze_file(self, path: str, content: str) -> FileMetrics:
        lines = content.splitlines()
        code_lines = [l for l in lines if l.strip() and not l.strip().startswith('//') and not l.strip().startswith('*')]
        comment_lines = [l for l in lines if l.strip().startswith('//') or l.strip().startswith('*') or l.strip().startswith('/*')]
        
        metrics = FileMetrics(
            path=path,
            extension=Path(path).suffix,
            lines=len(lines),
            code_lines=len(code_lines),
            comment_lines=len(comment_lines),
            blank_lines=len([l for l in lines if not l.strip()]),
            functions=len(re.findall(r'function\s+\w+', content)),
            classes=len(re.findall(r'class\s+\w+', content)),
            complexity=1 + len(re.findall(r'\b(if|for|while|switch|case|catch|&&|\|\|)\b', content)),
            max_nesting=self._calculate_nesting(content),
            todos=len(re.findall(r'TODO', content, re.I)),
            fixmes=len(re.findall(r'FIXME', content, re.I)),
            has_jsdoc=bool(re.search(r'/\*\*[\s\S]*?\*/', content)),
            has_error_handling=bool(re.search(r'try\s*\{|catch\s*\(|\.catch\(', content)),
            has_logging=bool(re.search(r'(Logger\.|console\.|log\(|AppLogger)', content)),
            hash=hashlib.md5(content.encode()).hexdigest()[:8]
        )
        
        # Detecta serviços GAS
        for service_name, pattern in GAS_PATTERNS.items():
            if re.search(pattern, content):
                metrics.gas_services.append(service_name)
        
        return metrics
    
    def _calculate_nesting(self, content: str) -> int:
        max_nesting = 0
        current = 0
        for char in content:
            if char == '{':
                current += 1
                max_nesting = max(max_nesting, current)
            elif char == '}':
                current = max(0, current - 1)
        return max_nesting


class ProjectAnalyzer:
    """Orquestrador de análise UNIAE CRE."""
    
    def __init__(self, project_path: str):
        self.project_path = Path(project_path).resolve()
        self.scanner = FileScanner()
        self.files: Dict[str, FileMetrics] = {}
        self.report: Optional[MaturityReport] = None
    
    def analyze(self) -> MaturityReport:
        """Executa análise completa do projeto."""
        start_time = datetime.now()
        
        # Escaneia arquivos
        self.files = self.scanner.scan(self.project_path)
        
        # Cria relatório
        self.report = MaturityReport(
            project_name=self.project_path.name,
            project_path=str(self.project_path),
            analysis_id=hashlib.md5(str(datetime.now()).encode()).hexdigest()[:12],
            analysis_date=datetime.now().isoformat(),
            analysis_duration_seconds=0,
            total_files=len(self.files),
            total_lines=sum(m.lines for m in self.files.values()),
            total_code_lines=sum(m.code_lines for m in self.files.values()),
            total_comment_lines=sum(m.comment_lines for m in self.files.values()),
            total_functions=sum(m.functions for m in self.files.values()),
            total_classes=sum(m.classes for m in self.files.values()),
        )
        
        # Executa analisadores
        analyzers = [
            ArchitectureAnalyzer,
            CodeQualityAnalyzer,
            DocumentationAnalyzer,
            TestingAnalyzer,
            SecurityAnalyzer,
            MaintainabilityAnalyzer,
            PerformanceAnalyzer,
            ReliabilityAnalyzer,
            ScalabilityAnalyzer,
            DevOpsAnalyzer,
            OrganizationAnalyzer,
            UXDesignAnalyzer,
            BusinessLogicAnalyzer,
            ComplianceAnalyzer,
            AccessibilityAnalyzer,
            WorkflowAtestoAnalyzer,
            GASIntegrationAnalyzer,
            MobileFirstAnalyzer,
        ]
        
        for AnalyzerClass in analyzers:
            try:
                analyzer = AnalyzerClass(self.project_path, self.files)
                category_score = analyzer.analyze()
                self.report.categories[category_score.category.key] = category_score
                self.report.all_issues.extend(category_score.issues)
            except Exception as e:
                safe_print(f"Erro em {AnalyzerClass.__name__}: {e}")
        
        # Calcula score geral
        self._calculate_overall_score()
        
        # Gera resumo executivo
        self._generate_executive_summary()
        
        # Finaliza
        self.report.analysis_duration_seconds = (datetime.now() - start_time).total_seconds()
        
        return self.report
    
    def _calculate_overall_score(self):
        """Calcula score geral ponderado."""
        total_weighted = 0
        total_weight = 0
        
        for cat_score in self.report.categories.values():
            total_weighted += cat_score.weighted_score
            total_weight += cat_score.category.weight
        
        if total_weight > 0:
            self.report.overall_score = total_weighted / total_weight
        
        self.report.maturity_level = MaturityLevel.from_score(self.report.overall_score)
    
    def _generate_executive_summary(self):
        """Gera resumo executivo com análise detalhada."""
        # Pontos fortes (>= 80%)
        for cat_key, cat_score in self.report.categories.items():
            if cat_score.percentage >= 80:
                self.report.strengths.append(f"{cat_score.category.label}: {cat_score.grade}")
        
        # Pontos fracos (< 60%)
        for cat_key, cat_score in self.report.categories.items():
            if cat_score.percentage < 60:
                self.report.weaknesses.append(f"{cat_score.category.label}: {cat_score.grade} ({cat_score.percentage:.0f}%)")
        
        # Oportunidades baseadas em métricas
        if self.report.overall_score < 90:
            self.report.opportunities.append("Potencial para atingir nível Otimizado (CMMI 5)")
        
        # Análise de god classes para action items
        arch_metrics = self.report.categories.get('architecture', {})
        if hasattr(arch_metrics, 'metrics') and 'god_classes' in arch_metrics.metrics:
            god_classes = arch_metrics.metrics['god_classes']
            if god_classes['count'] > 0:
                self.report.action_items.append({
                    'priority': 1,
                    'action': f"Refatorar {god_classes['count']} arquivos com mais de 1000 linhas",
                    'effort': 'Alta',
                    'category': 'Arquitetura',
                    'files': [f['file'] for f in god_classes['files'][:5]]
                })
        
        # Análise de complexidade
        code_quality = self.report.categories.get('code_quality', {})
        if hasattr(code_quality, 'metrics') and 'complexity' in code_quality.metrics:
            complexity = code_quality.metrics['complexity']
            if complexity.get('avg', 0) > 40:
                self.report.action_items.append({
                    'priority': 2,
                    'action': f"Reduzir complexidade média (atual: {complexity['avg']:.1f})",
                    'effort': 'Média',
                    'category': 'Qualidade de Código'
                })
        
        # Análise de cobertura de testes
        testing = self.report.categories.get('testing', {})
        if hasattr(testing, 'metrics') and 'coverage' in testing.metrics:
            coverage = testing.metrics['coverage']
            if coverage.get('percentage', 0) < 60:
                self.report.action_items.append({
                    'priority': 2,
                    'action': f"Aumentar cobertura de testes (atual: {coverage['percentage']:.1f}%)",
                    'effort': 'Média',
                    'category': 'Testes'
                })
        
        # Análise de dívida técnica
        maintainability = self.report.categories.get('maintainability', {})
        if hasattr(maintainability, 'metrics') and 'tech_debt' in maintainability.metrics:
            tech_debt = maintainability.metrics['tech_debt']
            if tech_debt.get('hours', 0) > 100:
                self.report.tech_debt_hours = tech_debt['hours']
                self.report.action_items.append({
                    'priority': 3,
                    'action': f"Planejar redução de dívida técnica ({tech_debt['hours']:.0f}h / {tech_debt['days']:.0f} dias)",
                    'effort': 'Alta',
                    'category': 'Manutenibilidade',
                    'details': {
                        'todos': tech_debt.get('todos', 0),
                        'complex_files': tech_debt.get('complex_files', 0),
                        'large_files': tech_debt.get('large_files', 0)
                    }
                })
        
        # Análise de padrão IIFE
        if hasattr(code_quality, 'metrics') and 'module_structure' in code_quality.metrics:
            module_struct = code_quality.metrics['module_structure']
            if module_struct.get('percentage', 0) < 60:
                self.report.action_items.append({
                    'priority': 3,
                    'action': f"Aumentar adoção do padrão IIFE (atual: {module_struct['percentage']:.1f}%)",
                    'effort': 'Baixa',
                    'category': 'Qualidade de Código'
                })
        
        # Issues críticos
        critical_issues = [i for i in self.report.all_issues if i.severity == Severity.CRITICAL]
        if critical_issues:
            self.report.action_items.insert(0, {
                'priority': 0,
                'action': f'Resolver {len(critical_issues)} issues críticos de segurança',
                'effort': 'Urgente',
                'category': 'Segurança'
            })
        
        # Ordena action items por prioridade
        self.report.action_items.sort(key=lambda x: x.get('priority', 99))


# ============================================================================
# GERADORES DE RELATÓRIO
# ============================================================================

class ReportGenerator:
    """Gera relatórios em múltiplos formatos."""
    
    @staticmethod
    def to_json(report: MaturityReport) -> str:
        """Gera relatório JSON."""
        data = {
            'metadata': {
                'project_name': report.project_name,
                'project_path': report.project_path,
                'analysis_id': report.analysis_id,
                'analysis_date': report.analysis_date,
                'analyzer_version': report.analyzer_version,
                'duration_seconds': report.analysis_duration_seconds,
            },
            'summary': {
                'overall_score': round(report.overall_score, 1),
                'maturity_level': report.maturity_level.name_pt,
                'maturity_description': report.maturity_level.description,
                'health_score': report.health_score,
                'quality_gate': report.quality_gate_status,
            },
            'metrics': {
                'total_files': report.total_files,
                'total_lines': report.total_lines,
                'total_code_lines': report.total_code_lines,
                'total_comment_lines': report.total_comment_lines,
                'total_functions': report.total_functions,
                'total_classes': report.total_classes,
            },
            'categories': {k: v.to_dict() for k, v in report.categories.items()},
            'issues': {
                'total': len(report.all_issues),
                'by_severity': report.issues_by_severity,
                'items': [i.to_dict() for i in report.all_issues[:50]],
            },
            'executive_summary': {
                'strengths': report.strengths,
                'weaknesses': report.weaknesses,
                'opportunities': report.opportunities,
                'action_items': report.action_items,
            },
        }
        return json.dumps(data, indent=2, ensure_ascii=False)
    
    @staticmethod
    def to_markdown(report: MaturityReport) -> str:
        """Gera relatório Markdown."""
        lines = [
            f"# Relatório de Maturidade - {report.project_name}",
            "",
            f"**Data:** {report.analysis_date[:10]}",
            f"**Versão do Analisador:** {report.analyzer_version}",
            f"**Duração:** {report.analysis_duration_seconds:.1f}s",
            "",
            "---",
            "",
            "## Resumo Executivo",
            "",
            f"| Métrica | Valor |",
            f"|---------|-------|",
            f"| Score Geral | **{report.overall_score:.1f}%** |",
            f"| Nível de Maturidade | **{report.maturity_level.name_pt}** |",
            f"| Status de Saúde | {report.health_score} |",
            f"| Quality Gate | {report.quality_gate_status} |",
            "",
            "---",
            "",
            "## Métricas do Projeto",
            "",
            f"| Métrica | Valor |",
            f"|---------|-------|",
            f"| Total de Arquivos | {report.total_files} |",
            f"| Total de Linhas | {report.total_lines:,} |",
            f"| Linhas de Código | {report.total_code_lines:,} |",
            f"| Linhas de Comentário | {report.total_comment_lines:,} |",
            f"| Total de Funções | {report.total_functions:,} |",
            f"| Total de Classes | {report.total_classes} |",
            "",
            "---",
            "",
            "## Pontuação por Categoria",
            "",
            "| Categoria | Score | Grade | Peso |",
            "|-----------|-------|-------|------|",
        ]
        
        for cat_key, cat_score in sorted(report.categories.items(), key=lambda x: x[1].percentage, reverse=True):
            lines.append(f"| {cat_score.category.label} | {cat_score.percentage:.1f}% | {cat_score.grade} | {cat_score.category.weight:.0%} |")
        
        lines.extend([
            "",
            "---",
            "",
            "## Pontos Fortes",
            "",
        ])
        
        for strength in report.strengths[:10]:
            lines.append(f"- ✅ {strength}")
        
        if not report.strengths:
            lines.append("- Nenhum ponto forte identificado acima de 80%")
        
        lines.extend([
            "",
            "## Áreas de Melhoria",
            "",
        ])
        
        for weakness in report.weaknesses[:10]:
            lines.append(f"- ⚠️ {weakness}")
        
        if not report.weaknesses:
            lines.append("- Nenhuma área crítica identificada abaixo de 50%")
        
        lines.extend([
            "",
            "---",
            "",
            "## Issues Identificados",
            "",
            f"**Total:** {len(report.all_issues)}",
            "",
        ])
        
        for sev, count in report.issues_by_severity.items():
            lines.append(f"- {sev}: {count}")
        
        # Plano de Refatoração
        if report.action_items:
            lines.extend([
                "",
                "---",
                "",
                "## Plano de Refatoração Prioritário",
                "",
            ])
            
            for i, item in enumerate(report.action_items, 1):
                priority_label = "🔴 URGENTE" if item.get('priority', 99) <= 1 else ("🟡 ALTA" if item.get('priority', 99) <= 2 else "🟢 MÉDIA")
                lines.append(f"### {i}. [{item.get('category', 'Geral')}] {item['action']}")
                lines.append(f"- **Prioridade:** {priority_label}")
                lines.append(f"- **Esforço:** {item.get('effort', 'N/A')}")
                if 'files' in item:
                    lines.append(f"- **Arquivos afetados:** {', '.join(item['files'])}")
                if 'details' in item:
                    details = item['details']
                    if isinstance(details, dict):
                        for k, v in details.items():
                            lines.append(f"  - {k}: {v}")
                lines.append("")
        
        # God Classes detalhado
        arch_metrics = report.categories.get('architecture')
        if arch_metrics and hasattr(arch_metrics, 'metrics') and 'god_classes' in arch_metrics.metrics:
            god_classes = arch_metrics.metrics['god_classes']
            if god_classes['count'] > 0:
                lines.extend([
                    "---",
                    "",
                    "## Arquivos para Refatoração (God Classes > 1000 linhas)",
                    "",
                    "| Arquivo | Linhas | Funções | Sugestão |",
                    "|---------|--------|---------|----------|",
                ])
                for gc in god_classes['files']:
                    suggestion = "Dividir em módulos menores" if gc['lines'] > 1500 else "Extrair funções auxiliares"
                    lines.append(f"| {gc['file']} | {gc['lines']} | {gc['functions']} | {suggestion} |")
                lines.append("")
        
        # Arquivos com alta complexidade
        code_quality = report.categories.get('code_quality')
        if code_quality and hasattr(code_quality, 'metrics') and 'complexity' in code_quality.metrics:
            complexity = code_quality.metrics['complexity']
            if 'high_complexity_files' in complexity and complexity['high_complexity_files']:
                lines.extend([
                    "---",
                    "",
                    "## Arquivos com Alta Complexidade (> 60)",
                    "",
                    "| Arquivo | Complexidade | Funções |",
                    "|---------|--------------|---------|",
                ])
                for hc in complexity['high_complexity_files'][:10]:
                    lines.append(f"| {hc['file']} | {hc['complexity']} | {hc['functions']} |")
                lines.append("")
        
        # TODOs por arquivo
        maintainability = report.categories.get('maintainability')
        if maintainability and hasattr(maintainability, 'metrics') and 'tech_debt' in maintainability.metrics:
            tech_debt = maintainability.metrics['tech_debt']
            if 'todos_by_file' in tech_debt and tech_debt['todos_by_file']:
                lines.extend([
                    "---",
                    "",
                    "## Arquivos com TODOs Pendentes",
                    "",
                    "| Arquivo | TODOs |",
                    "|---------|-------|",
                ])
                for todo in tech_debt['todos_by_file'][:10]:
                    lines.append(f"| {todo['file']} | {todo['todos']} |")
                lines.append("")
        
        lines.extend([
            "",
            "---",
            "",
            f"*Gerado por EPMA v{report.analyzer_version} - UNIAE CRE Edition*",
        ])
        
        return "\n".join(lines)
    
    @staticmethod
    def to_console(report: MaturityReport):
        """Imprime relatório no console."""
        safe_print("")
        safe_print("=" * 70)
        safe_print(f"  RELATÓRIO DE MATURIDADE - {report.project_name.upper()}")
        safe_print("=" * 70)
        safe_print("")
        safe_print(f"  Score Geral: {report.overall_score:.1f}%")
        safe_print(f"  Nível: {report.maturity_level.name_pt}")
        safe_print(f"  Status: {report.health_score}")
        safe_print(f"  Quality Gate: {report.quality_gate_status}")
        safe_print("")
        safe_print("-" * 70)
        safe_print("  MÉTRICAS DO PROJETO")
        safe_print("-" * 70)
        safe_print(f"  Arquivos: {report.total_files}")
        safe_print(f"  Linhas de Código: {report.total_code_lines:,}")
        safe_print(f"  Funções: {report.total_functions:,}")
        if report.tech_debt_hours > 0:
            safe_print(f"  Dívida Técnica: {report.tech_debt_hours:.0f}h ({report.tech_debt_days:.0f} dias)")
        safe_print("")
        safe_print("-" * 70)
        safe_print("  PONTUAÇÃO POR CATEGORIA")
        safe_print("-" * 70)
        
        for cat_key, cat_score in sorted(report.categories.items(), key=lambda x: x[1].percentage, reverse=True):
            bar_len = int(cat_score.percentage / 5)
            bar = "█" * bar_len + "░" * (20 - bar_len)
            safe_print(f"  {cat_score.category.label:25} [{bar}] {cat_score.percentage:5.1f}% ({cat_score.grade})")
        
        safe_print("")
        safe_print("-" * 70)
        safe_print("  ISSUES")
        safe_print("-" * 70)
        
        if report.issues_by_severity:
            for sev, count in report.issues_by_severity.items():
                safe_print(f"  {sev}: {count}")
        else:
            safe_print("  Nenhum issue crítico identificado")
        
        # Action Items
        if report.action_items:
            safe_print("")
            safe_print("-" * 70)
            safe_print("  AÇÕES PRIORITÁRIAS")
            safe_print("-" * 70)
            for i, item in enumerate(report.action_items[:5], 1):
                priority_icon = "🔴" if item.get('priority', 99) <= 1 else ("🟡" if item.get('priority', 99) <= 2 else "🟢")
                safe_print(f"  {i}. {priority_icon} [{item.get('category', 'Geral')}] {item['action']}")
                if 'files' in item:
                    safe_print(f"     Arquivos: {', '.join(item['files'][:3])}...")
        
        # Pontos Fortes
        if report.strengths:
            safe_print("")
            safe_print("-" * 70)
            safe_print("  PONTOS FORTES (>= 80%)")
            safe_print("-" * 70)
            for strength in report.strengths[:8]:
                safe_print(f"  ✅ {strength}")
        
        # Áreas de Melhoria
        if report.weaknesses:
            safe_print("")
            safe_print("-" * 70)
            safe_print("  ÁREAS DE MELHORIA (< 60%)")
            safe_print("-" * 70)
            for weakness in report.weaknesses[:5]:
                safe_print(f"  ⚠️ {weakness}")
        
        safe_print("")
        safe_print("=" * 70)
        safe_print(f"  Análise concluída em {report.analysis_duration_seconds:.1f}s")
        safe_print(f"  EPMA v{report.analyzer_version} - UNIAE CRE Edition")
        safe_print("=" * 70)
        safe_print("")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Função principal."""
    parser = argparse.ArgumentParser(
        description='EPMA v5.0 - Enterprise Project Maturity Analyzer - UNIAE CRE Edition',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python project_maturity_analyzer.py .
  python project_maturity_analyzer.py . --output report.json --format json
  python project_maturity_analyzer.py . --output report.md --format markdown
        """
    )
    
    parser.add_argument('path', nargs='?', default='.', help='Caminho do projeto (padrão: diretório atual)')
    parser.add_argument('--output', '-o', help='Arquivo de saída')
    parser.add_argument('--format', '-f', choices=['json', 'markdown', 'console'], default='console',
                       help='Formato de saída (padrão: console)')
    parser.add_argument('--version', '-v', action='version', version=f'EPMA v{__version__}')
    
    args = parser.parse_args()
    
    # Verifica se o caminho existe
    project_path = Path(args.path).resolve()
    if not project_path.exists():
        safe_print(f"Erro: Caminho não encontrado: {project_path}")
        sys.exit(1)
    
    safe_print(f"")
    safe_print(f"EPMA v{__version__} - Enterprise Project Maturity Analyzer")
    safe_print(f"UNIAE CRE Edition - Sistema de Atesto de Gêneros Alimentícios")
    safe_print(f"")
    safe_print(f"Analisando: {project_path}")
    safe_print(f"")
    
    # Executa análise
    analyzer = ProjectAnalyzer(str(project_path))
    report = analyzer.analyze()
    
    # Gera saída
    if args.format == 'json':
        output = ReportGenerator.to_json(report)
        if args.output:
            Path(args.output).write_text(output, encoding='utf-8')
            safe_print(f"Relatório JSON salvo em: {args.output}")
        else:
            print(output)
    
    elif args.format == 'markdown':
        output = ReportGenerator.to_markdown(report)
        if args.output:
            Path(args.output).write_text(output, encoding='utf-8')
            safe_print(f"Relatório Markdown salvo em: {args.output}")
        else:
            print(output)
    
    else:
        ReportGenerator.to_console(report)
        if args.output:
            output = ReportGenerator.to_json(report)
            Path(args.output).write_text(output, encoding='utf-8')
            safe_print(f"Relatório JSON também salvo em: {args.output}")
    
    # Retorna código de saída baseado no quality gate
    if "FAILED" in report.quality_gate_status:
        sys.exit(1)
    return 0


if __name__ == '__main__':
    main()
