import { colors, font, radius, spacing } from '@knobs/ui/tokens.stylex';
import { create, props } from '@stylexjs/stylex';
import { createFileRoute } from '@tanstack/react-router';
import { mount, unmount } from 'devknobs';
import { useEffect } from 'react';
import { track } from '../lib/analytics.ts';
import { m } from '../paraglide/messages.js';

export const Route = createFileRoute('/')({
  component: Landing,
});

// The one breakpoint on the page. devknobs rewrites `min-width` queries, so the
// width knob collapses these columns exactly like a real narrow viewport does.
const WIDE = '@media (min-width: 640px)';

// The devknobs host element. Its shadow root is open, so a click inside the
// panel still reaches `document` with the real button in its composed path.
const PANEL = '[data-devknobs="panel"]';

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

/**
 * A composed path is a list of `EventTarget`s: the shadow root, `document` and
 * `window` ride along with the elements. Only the elements answer `matches` and
 * `closest`, and only they carry a node type of their own.
 */
function asElement(node: EventTarget | undefined): Element | null {
  const element = node as Element | null | undefined;
  return element?.nodeType === Node.ELEMENT_NODE ? element : null;
}

/**
 * Every click on the page, read and reported: the footer links, and which knob
 * of the demo panel a visitor actually turns. It only observes. No
 * `preventDefault`, no `stopPropagation`, so the click behaves as it always did.
 */
function trackClick(event: MouseEvent) {
  const path = event.composedPath();
  const target = asElement(path[0]);
  if (target === null) {
    return;
  }
  if (path.some((node) => asElement(node)?.matches(PANEL) === true)) {
    // The geo fields are inputs, not buttons, and a click on the panel's own
    // chrome hits nothing at all.
    const control = target.closest('button');
    if (control === null) {
      return;
    }
    const text = control.textContent?.trim();
    track('knob_click', {
      // Every knob button carries its choice as text; the edge tab does not.
      control:
        (text === undefined || text === '' ? control.getAttribute('aria-label') : text) ??
        undefined,
      // The first `.label` names the group. The tab, replay and reset have none.
      group: control.closest('.group')?.querySelector('.label')?.textContent?.trim(),
    });
    return;
  }
  const link = target.closest('a');
  if (link === null) {
    return;
  }
  track('link_click', { href: link.href, label: link.textContent?.trim() });
}

function Landing() {
  // The panel is the demo, so it runs here in every environment, not gated on
  // dev the way an app embedding devknobs would gate it. Client-only: `mount`
  // touches `document`, and SSR must never reach it. It starts collapsed to the
  // edge tab the hero points at, instead of the package default of open, which
  // covers the hero on a phone.
  useEffect(() => {
    mount({ open: false });
    // One delegated listener for the whole page, panel included. Passive: it
    // never cancels the click it is reading.
    document.addEventListener('click', trackClick, { passive: true });
    return () => {
      document.removeEventListener('click', trackClick);
      unmount();
    };
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
        <a
          href="https://mertbuilds.com/?utm_source=knobs.dev&utm_medium=referral&utm_campaign=footer"
          {...props(styles.link)}
        >
          {m.link_mertbuilds()}
        </a>
      </footer>
    </main>
  );
}
