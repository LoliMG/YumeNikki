import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Scale,
  FileText,
  ShieldCheck,
  Cookie,
  Printer,
  ArrowLeft,
  ChevronRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import Logo from '../../components/Logo/Logo';
import { legalData } from '../../data/legalData';
import './LegalPage.css';

const SECTIONS_CONFIG = [
  {
    id: 'aviso-legal',
    path: '/legal/aviso-legal',
    label: 'Aviso Legal',
    desc: 'Datos identificativos y normas de acceso (LSSI)',
    icon: Scale
  },
  {
    id: 'condiciones',
    path: '/legal/condiciones',
    label: 'Condiciones de Uso',
    desc: 'Términos contractuales y propiedad de tus sueños',
    icon: FileText
  },
  {
    id: 'privacidad',
    path: '/legal/privacidad',
    label: 'Política de Privacidad',
    desc: 'Tratamiento y protección de datos íntimos (RGPD)',
    icon: ShieldCheck
  },
  {
    id: 'cookies',
    path: '/legal/cookies',
    label: 'Política de Cookies',
    desc: 'Almacenamiento web técnico sin rastreadores',
    icon: Cookie
  }
];

const LegalPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();

  // Normalizar sección activa o fallback a 'aviso-legal'
  const activeSectionKey = SECTIONS_CONFIG.some(s => s.id === section) ? section : 'aviso-legal';
  const currentDoc = legalData[activeSectionKey] || legalData['aviso-legal'];

  // Scroll to top cuando cambia de sección
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `${currentDoc.title} | Yume Nikki Legal`;
  }, [activeSectionKey, currentDoc.title]);

  const handlePrint = () => {
    window.print();
  };

  const scrollToArticle = (artNum) => {
    const el = document.getElementById(`articulo-${artNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="legal-page-root">
      {/* Top Header Bar */}
      <header className="legal-top-navbar">
        <div className="legal-navbar-container">
          <div className="legal-nav-brand">
            <Link to="/" className="legal-brand-link" title="Ir al inicio de Yume Nikki">
              <Logo size="sm" showText={false} />
              <span className="legal-brand-text">Yume Nikki</span>
            </Link>
            <span className="legal-nav-badge">
              <Scale size={13} />
              <span>Centro Legal</span>
            </span>
          </div>

          <div className="legal-nav-actions">
            <button
              type="button"
              className="legal-action-btn secondary"
              onClick={handlePrint}
              title="Imprimir o guardar en PDF este documento"
            >
              <Printer size={15} />
              <span className="btn-label">Imprimir</span>
            </button>
            <button
              type="button"
              className="legal-action-btn primary"
              onClick={() => navigate('/')}
              title="Volver a Yume Nikki"
            >
              <ArrowLeft size={15} />
              <span>Volver</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="legal-page-container">
        {/* Left Sticky Sidebar Navigation */}
        <aside className="legal-sidebar">
          <div className="sidebar-group-title">Documentos Legales</div>
          <nav className="legal-nav-list">
            {SECTIONS_CONFIG.map((sec) => {
              const IconComp = sec.icon;
              const isActive = sec.id === activeSectionKey;
              return (
                <Link
                  key={sec.id}
                  to={sec.path}
                  replace
                  className={`legal-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="item-icon-box">
                    <IconComp size={16} />
                  </div>
                  <div className="item-info">
                    <span className="item-title">{sec.label}</span>
                    <span className="item-desc">{sec.desc}</span>
                  </div>
                  <ChevronRight size={14} className="item-arrow" />
                </Link>
              );
            })}
          </nav>

          {/* Índice de artículos del documento actual */}
          <div className="legal-toc-box">
            <div className="toc-header">
              <FileText size={13} />
              <span>Índice de Artículos</span>
            </div>
            <ul className="toc-list">
              {currentDoc.articles.map((art) => (
                <li key={art.num}>
                  <button
                    type="button"
                    className="toc-link"
                    onClick={() => scrollToArticle(art.num)}
                  >
                    <span className="toc-num">{art.num}.</span>
                    <span className="toc-text">{art.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Right Main Content Body */}
        <main className="legal-main-content">
          {/* Header exclusivo para impresión y guardado en PDF */}
          <div className="legal-print-header">
            <div className="print-brand-row">
              <span className="print-brand-name">Yume Nikki</span>
              <span className="print-doc-type">Documentación Legal Oficial</span>
            </div>
          </div>

          <div className="doc-header-card animate-fade-in">
            <div className="doc-meta-row">
              <span className="doc-tag">Normativa Oficial</span>
              <span className="doc-date">
                <Calendar size={13} />
                <span>Última revisión: {currentDoc.lastUpdated}</span>
              </span>
            </div>
            <h1 className="doc-title">{currentDoc.title}</h1>
            <p className="doc-subtitle">{currentDoc.subtitle}</p>

            {/* Banner de resumen destacado */}
            <div className="doc-summary-banner">
              <Sparkles size={18} className="summary-icon flex-shrink-0" />
              <div>
                <strong>En resumen:</strong>
                <p>{currentDoc.summary}</p>
              </div>
            </div>
          </div>

          {/* Listado de artículos */}
          <div className="doc-articles-container">
            {currentDoc.articles.map((art) => (
              <section
                key={art.num}
                id={`articulo-${art.num}`}
                className="legal-article-card animate-fade-in"
              >
                <div className="article-header-row">
                  <span className="article-badge">Artículo {art.num}</span>
                  <h2 className="article-heading">{art.title}</h2>
                </div>

                <div className="article-body-text">
                  {art.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split('\n').map((line, lIdx) => (
                        <React.Fragment key={lIdx}>
                          {line}
                          {lIdx < paragraph.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </p>
                  ))}
                </div>

                {/* Si el artículo incluye tabla (ej. política de cookies) */}
                {art.isTable && art.tableData && (
                  <div className="legal-table-wrapper">
                    <table className="legal-data-table">
                      <thead>
                        <tr>
                          <th>Nombre / Clave</th>
                          <th>Tipo</th>
                          <th>Origen</th>
                          <th>Caducidad</th>
                          <th>Finalidad Técnica</th>
                        </tr>
                      </thead>
                      <tbody>
                        {art.tableData.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td className="table-code-cell">
                              <code>{row.name}</code>
                            </td>
                            <td>
                              <span className="table-badge type">{row.type}</span>
                            </td>
                            <td>{row.provider}</td>
                            <td>{row.duration}</td>
                            <td className="table-purpose-cell">{row.purpose}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Pie de página exclusivo para impresión y PDF */}
          <div className="legal-print-footer">
            <span>Yume Nikki &bull; https://yumenikki.app &bull; Documento generado para consulta oficial y archivo</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LegalPage;
