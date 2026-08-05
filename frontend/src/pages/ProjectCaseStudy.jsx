import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, X, Code2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects as mockProjects, slugify } from '../mock';
import MacDockNavigation from '../components/MacDockNavigation';
import ProjectMedia from '../components/ProjectMedia';
import { getTagStyle } from '../utils/tagColors';
import SEO from '../components/SEO';
import { API_BASE, getMediaUrl } from '../utils/api';
import { QUOTE_FONT, quoteColors } from '../utils/quoteStyle';
import './ProjectCaseStudy.css';

const defaultDetails = [
  {
    title: 'Logotype & Geometry',
    description: 'Built on refined geometry, the logotype feels simple, confident, and approachable. The continuous line introduces flow and movement.',
  },
  {
    title: 'Visual Identity System',
    description: 'Our visual language pairs high-contrast typographic hierarchy with fluid grid alignments. Built to adapt across digital displays and physical touchpoints.',
  },
  {
    title: 'Color Architecture',
    description: 'Curated color palettes balance functional clarity with emotional depth. Tones shift dynamically from subtle warm neutrals to high-contrast accents.',
  },
];

// Helper component to render Next.js / Codeblocks or HTML embeds
function CodeOrHtmlComponent({ content }) {
  const [copied, setCopied] = useState(false);
  if (!content) return null;

  const isRawHtml = /^\s*<(div|iframe|svg|section|p|style|header|footer|main|article|span|a|ul|ol|li)/i.test(content.trim());

  if (isRawHtml) {
    return (
      <div
        className="w-full bg-neutral-900 text-white p-8 md:p-12 overflow-auto"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#121619] border-y border-neutral-800 p-4 md:p-8 font-mono text-sm leading-relaxed overflow-x-auto text-neutral-100 relative">
      {/* IDE Code Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block opacity-80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block opacity-80" />
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block opacity-80" />
          <span className="ml-2 flex items-center gap-1.5 font-bold text-neutral-300">
            <Code2 size={13} className="text-[#97D9AF]" /> Next.js / Codeblock
          </span>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          title="Copy Code"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <pre className="overflow-x-auto whitespace-pre font-mono text-xs md:text-sm text-emerald-400 leading-relaxed">
        <code>{content}</code>
      </pre>
    </div>
  );
}

const ProjectCaseStudy = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeInsight, setActiveInsight] = useState(null);
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const resAll = await fetch(`${API_BASE}/projects`);
      if (resAll.ok) {
        const list = await resAll.json();
          setAllProjects(list.map((p) => ({
            ...p,
            slug: p.slug || slugify(p.name),
            image: p.coverImage || p.image || p.sliderImage,
          })));
      }

      const resSingle = await fetch(`${API_BASE}/projects/${projectId}`);
      if (resSingle.ok) {
        const data = await resSingle.json();
        setProject(data);
        return;
      }
    } catch (e) {
      console.warn("Using fallback project case study data");
    }

    // Fallback to mock projects
    const found = mockProjects.find((p) => (p.slug || slugify(p.name)) === projectId) || mockProjects[0];
    setProject(found);
  };

  if (!project) {
    return <div className="p-20 text-center text-neutral-800 font-semibold">Loading case study...</div>;
  }

  const showcaseComponents = (project.components && project.components.length > 0)
    ? project.components
    : [
        { type: "image", contentUrl: project.coverImage || project.image, insight: defaultDetails[0] },
        { type: "image", contentUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop", insight: defaultDetails[1] },
        { type: "image", contentUrl: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1600&auto=format&fit=crop", insight: defaultDetails[2] }
      ];

  const handleSelectProject = (selected) => {
    const targetSlug = selected.slug || slugify(selected.name);
    navigate(`/work/${targetSlug}`);
  };

  const heroMediaUrl = project.heroMedia || project.coverImage || project.image;
  const explainingTitle = project.title || project.name;
  const projectDescription = project.subtitle || project.description || `Read the full case study for ${explainingTitle} by Paper Hoof Studio.`;

  return (
    <div className="case-study-page">
      <SEO
        title={`${explainingTitle} — Paper Hoof Studio Case Study`}
        description={projectDescription}
        path={`/work/${project.slug || slugify(project.name)}`}
        image={heroMediaUrl}
      />
      {/* 1: Explaining Title Section */}
      <header className="case-study-title-section">
        <div className="case-study-container">
          <h1 className="case-study-main-title">{explainingTitle}</h1>
        </div>
      </header>

      {/* 2: Hero Page Showcase Media */}
      <section className="case-study-hero-section">
        {/* Hero may be a still, an animated GIF, or a video — ProjectMedia picks the element. */}
        <ProjectMedia
          url={heroMediaUrl}
          mediaType={project.heroMediaType}
          alt={`Paper Hoof Brand Strategy Case Study — ${project.name}`}
          className="case-study-hero-image"
        />
      </section>

      {/* 3: Overview Section */}
      <section className="case-study-overview-section">
        <div className="case-study-container overview-grid">
          {/* Left Column: Scope Pills */}
          <div className="overview-left-meta">
            <span className="overview-section-label">OVERVIEW</span>
            <div className="overview-tags-list">
              {(project.tags || []).map((tag, index) => (
                <span key={index} className="overview-tag-pill" style={getTagStyle(tag)}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Subtitle & Description */}
          <div className="overview-right-content">
            {/* Subtitle is visible when Read More is NOT pressed */}
            {project.subtitle && (
              <p className="overview-lead-paragraph">
                {project.subtitle}
              </p>
            )}
            
            {/* Description & ReadMoreText are visible when Read More IS pressed */}
            {isExpanded && (
              <div className="overview-expanded-body">
                {project.description && (
                  <p>{project.description}</p>
                )}
                {project.readMoreText && (
                  <p>{project.readMoreText}</p>
                )}
                {!project.description && !project.readMoreText && (
                  <p>
                    {`${project.name} partnered with Paper Hoof to sharpen a brand that had grown faster than its identity could keep up. We began with research — stakeholder interviews, audience mapping, and a close look at the market.`}
                  </p>
                )}
              </div>
            )}

            <button
              className="read-more-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'Read Less' : 'Read More'}</span>
              <ChevronDown className={`toggle-icon ${isExpanded ? 'rotated' : ''}`} size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 4: Presentation Components Stack */}
      <section className="case-study-presentation-section">
        <div className="presentation-media-stack">
          {showcaseComponents.map((comp, index) => {
            const isInsightOpen = activeInsight === index;
            const insightTitle = comp.insight?.title;
            const insightDesc = comp.insight?.description;
            const hasInsight = Boolean(insightTitle || insightDesc);

            return (
              <div key={comp.id || index} className="case-study-component-item">
                {comp.type === "video" ? (
                  <video
                    src={getMediaUrl(comp.contentUrl)}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="component-media-img"
                  />
                ) : comp.type === "html" ? (
                  <CodeOrHtmlComponent content={comp.contentUrl} />
                ) : comp.type === "quote" ? (
                  <div
                    className="case-study-quote-wrapper w-full py-16 px-6 md:py-28 md:px-16 flex flex-col items-center justify-center text-center transition-colors duration-300"
                    style={{
                      backgroundColor: quoteColors(comp).bg,
                      color: quoteColors(comp).text
                    }}
                  >
                    <blockquote
                      className="case-study-quote-text text-2xl md:text-4xl lg:text-5xl font-extrabold not-italic leading-tight max-w-4xl tracking-tight"
                      style={{
                        fontFamily: QUOTE_FONT,
                        color: quoteColors(comp).text
                      }}
                    >
                      “{comp.quoteText || comp.contentUrl}”
                    </blockquote>
                    {comp.author && (
                      <cite
                        className="case-study-quote-author mt-8 text-sm md:text-base tracking-widest uppercase not-italic font-extrabold"
                        style={{
                          fontFamily: QUOTE_FONT,
                          color: quoteColors(comp).author
                        }}
                      >
                        — {comp.author}
                      </cite>
                    )}
                  </div>
                ) : comp.type === "grid" ? (
                  <div className="case-study-grid-wrapper w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-transparent py-2">
                    {(comp.gridUrls && comp.gridUrls.filter(Boolean).length > 0
                      ? comp.gridUrls.filter(Boolean)
                      : [comp.contentUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200", comp.contentUrl || "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200"]
                    ).map((url, gIdx) => (
                      <div key={gIdx} className="w-full overflow-hidden rounded-xl bg-neutral-100">
                        <img
                          src={getMediaUrl(url)}
                          alt={`Paper Hoof Studio — ${project.name} design showcase grid item ${gIdx + 1}`}
                          className="w-full h-[380px] sm:h-[480px] md:h-[620px] object-cover block transition-transform duration-500 hover:scale-[1.02]"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <img
                    src={getMediaUrl(comp.contentUrl)}
                    alt={`Paper Hoof Studio — ${project.name} visual identity showcase ${index + 1}`}
                    className="component-media-img"
                  />
                )}

                {/* Bottom-Left Expandable Insight Button */}
                {hasInsight && (
                  <div className="component-insight-container">
                    <AnimatePresence mode="wait">
                      {!isInsightOpen ? (
                        <motion.button
                          key="pill-btn"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="component-insight-pill"
                          onClick={() => setActiveInsight(index)}
                          aria-label={`View detail for ${insightTitle || "insight"}`}
                        >
                          <span className="pill-title-text">{insightTitle || "View Detail"}</span>
                          <div className="pill-plus-icon">
                            <Plus size={14} />
                          </div>
                        </motion.button>
                      ) : (
                        <motion.div
                          key="insight-modal"
                          initial={{ opacity: 0, scale: 0.92, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92, y: 10 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="component-insight-modal"
                        >
                          <div className="insight-modal-header">
                            <h4 className="insight-modal-title">{insightTitle || "Detail"}</h4>
                            <button
                              className="insight-modal-close"
                              onClick={() => setActiveInsight(null)}
                              aria-label="Close insight detail"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          {insightDesc && <p className="insight-modal-body">{insightDesc}</p>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5: Bottom Dock Navigation */}
      <MacDockNavigation
        projects={allProjects.length > 0 ? allProjects : mockProjects}
        activeSlug={project.slug || slugify(project.name)}
        onSelect={handleSelectProject}
      />
    </div>
  );
};

export default ProjectCaseStudy;
