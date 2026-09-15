import { colors, font, radius, spacing } from '@knobs/ui/tokens.stylex';
import { create, props } from '@stylexjs/stylex';
import { createFileRoute } from '@tanstack/react-router';
import { mount, unmount } from 'devknobs';
import { useEffect } from 'react';
import { m } from '../paraglide/messages.js';

export const Route = createFileRoute('/')({
  component: Landing,
});

// The one breakpoint on the page. devknobs rewrites `min-width` queries, so the
// width knob collapses these columns exactly like a real narrow viewport does.
const WIDE = '@media (min-width: 640px)';

const styles = create({
  blocks: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.s6,
  },
  code: {
    borderColor: colors.border,
    borderRadius: radius.base,
    borderStyle: 'solid',
    borderWidth: 1,
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    fontSize: 13,
    lineHeight: 1.7,
    margin: 0,
    overflowX: 'auto',
    padding: spacing.s3,
    whiteSpace: 'pre',
  },
  footer: {
    borderTopColor: colors.border,
    borderTopStyle: 'solid',
    borderTopWidth: 1,
    columnGap: spacing.s6,
    display: 'flex',
    flexWrap: 'wrap',
    paddingTop: spacing.s6,
    rowGap: spacing.s2,
  },
  hint: {
    color: colors.muted,
    fontSize: font.sizeSm,
    margin: 0,
  },
  // Hugs the one short line instead of stretching an empty box across the hero.
  installCode: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  knob: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.s1,
  },
  knobDetail: {
    color: colors.muted,
    fontSize: font.sizeSm,
    margin: 0,
  },
  knobName: {
    fontWeight: font.weightMedium,
  },
  knobs: {
    columnGap: spacing.s8,
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      [WIDE]: '1fr 1fr',
    },
    margin: 0,
    rowGap: spacing.s6,
  },
  link: {
    color: {
      ':hover': colors.fg,
      default: colors.muted,
    },
    textDecorationLine: 'underline',
    textUnderlineOffset: '3px',
    transitionDuration: '150ms',
    transitionProperty: 'color',
  },
  note: {
    color: colors.muted,
    fontSize: font.sizeSm,
    margin: 0,
  },
  page: {
    backgroundColor: colors.bg,
    color: colors.fg,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: font.family,
    fontSize: 15,
    gap: {
      default: spacing.s12,
      [WIDE]: spacing.s16,
    },
    lineHeight: 1.6,
    marginInline: 'auto',
    maxWidth: 720,
    paddingBlock: {
      default: spacing.s12,
      [WIDE]: spacing.s16,
    },
    paddingInline: spacing.s4,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.s4,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: font.weightMedium,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  snippet: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.s2,
  },
  snippetLabel: {
    color: colors.muted,
    fontSize: font.sizeSm,
  },
  text: {
    margin: 0,
  },
  wordmark: {
    fontSize: 19,
    fontWeight: font.weightMedium,
    letterSpacing: '-0.01em',
    margin: 0,
  },
});

function Knob({ detail, name }: { detail: string; name: string }) {
  return (
    <div {...props(styles.knob)}>
      <dt {...props(styles.knobName)}>{name}</dt>
      <dd {...props(styles.knobDetail)}>{detail}</dd>
    </div>
  );
}

function Snippet({ code, label }: { code: string; label: string }) {
  return (
    <div {...props(styles.snippet)}>
      <span {...props(styles.snippetLabel)}>{label}</span>
      <pre {...props(styles.code)}>{code}</pre>
    </div>
  );
}

function Landing() {
  // The panel is the demo, so it runs here in every environment, not gated on
  // dev the way an app embedding devknobs would gate it. Client-only: `mount`
  // touches `document`, and SSR must never reach it. It starts collapsed to the
  // edge tab the hero points at, instead of the package default of open, which
  // covers the hero on a phone.
  useEffect(() => {
    mount({ open: false });
    return unmount;
  }, []);

  return (
    <main {...props(styles.page)}>
      <header {...props(styles.section)}>
        <h1 {...props(styles.wordmark)}>{m.app_name()}</h1>
        <p {...props(styles.text)}>{m.tagline()}</p>
        <pre {...props(styles.code, styles.installCode)}>{m.install_command()}</pre>
        <p {...props(styles.hint)}>{m.hero_hint()}</p>
      </header>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.how_title()}</h2>
        <p {...props(styles.text)}>{m.how_css()}</p>
        <p {...props(styles.text)}>{m.how_js()}</p>
        <p {...props(styles.text)}>{m.how_setup()}</p>
      </section>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.knobs_title()}</h2>
        <dl {...props(styles.knobs)}>
          <Knob detail={m.knob_scheme_detail()} name={m.knob_scheme()} />
          <Knob detail={m.knob_motion_detail()} name={m.knob_motion()} />
          <Knob detail={m.knob_contrast_detail()} name={m.knob_contrast()} />
          <Knob detail={m.knob_locale_detail()} name={m.knob_locale()} />
          <Knob detail={m.knob_geo_detail()} name={m.knob_geo()} />
          <Knob detail={m.knob_text_detail()} name={m.knob_text()} />
          <Knob detail={m.knob_width_detail()} name={m.knob_width()} />
          <Knob detail={m.knob_outlines_detail()} name={m.knob_outlines()} />
          <Knob detail={m.knob_replay_detail()} name={m.knob_replay()} />
        </dl>
      </section>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.usage_title()}</h2>
        <div {...props(styles.blocks)}>
          <Snippet code={m.usage_script_code()} label={m.usage_script_label()} />
          <Snippet code={m.usage_import_code()} label={m.usage_import_label()} />
          <Snippet code={m.usage_react_code()} label={m.usage_react_label()} />
        </div>
        <p {...props(styles.note)}>{m.usage_react_note()}</p>
      </section>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.limits_title()}</h2>
        <p {...props(styles.text)}>{m.limits_body()}</p>
      </section>

      <footer {...props(styles.footer)}>
        <a href="https://github.com/mertbuilds/devknobs" {...props(styles.link)}>
          {m.link_github()}
        </a>
        <a href="https://www.npmjs.com/package/devknobs" {...props(styles.link)}>
          {m.link_npm()}
        </a>
        <a href="https://mertbuilds.com" {...props(styles.link)}>
          {m.link_mertbuilds()}
        </a>
      </footer>
    </main>
  );
}
