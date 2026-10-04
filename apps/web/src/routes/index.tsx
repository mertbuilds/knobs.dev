import { colors, font, radius, spacing } from '@knobs/ui/tokens.stylex';
import { create, props, type StyleXStyles } from '@stylexjs/stylex';
import { createFileRoute } from '@tanstack/react-router';
import { getState, mount, reset, setState, unmount, type DevknobsStatePatch } from 'devknobs';
import { useEffect, useRef, useState } from 'react';
import { track } from '../lib/analytics.ts';
import { m } from '../paraglide/messages.js';

export const Route = createFileRoute('/')({
  component: Landing,
});

// The one breakpoint on the page. A device or a width puts the page in a frame
// that size, so these columns collapse the way they do on a real phone.
const WIDE = '@media (min-width: 640px)';

// Each "try it" button and the knobs it turns, built at click time so the
// clock counts from the moment of the click.
const DEMOS = {
  arabic: () => ({ locale: { dir: 'system', lang: 'ar' } }),
  iphone: () => ({ device: 'iphone-17-pro' }),
  pixel: () => ({ device: 'pixel-10' }),
  // The opposite of the scheme in use, so it shows on either system setting.
  scheme: () => {
    const { scheme } = getState();
    const dark =
      scheme === 'system' ? matchMedia('(prefers-color-scheme: dark)').matches : scheme === 'dark';
    return { scheme: dark ? 'light' : 'dark' };
  },
  tomorrow: () => {
    const now = new Date();
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9).getTime();
    return { clock: { at, mode: 'offset', speed: 1 } };
  },
} satisfies Record<string, () => DevknobsStatePatch>;

type Demo = keyof typeof DEMOS | 'reset';

declare global {
  interface Window {
    knobsDemo?: (demo: Demo) => void;
  }
}

// The devknobs host element. Its shadow root is open, so a click inside the
// panel still reaches `document` with the real button in its composed path.
const PANEL = '[data-devknobs="panel"]';

const NOTICES = 'https://github.com/mertbuilds/devknobs/blob/main/THIRD_PARTY_NOTICES.md';

const styles = create({
  // The feature grid's own row gap, so the line below it reads as a new block.
  afterFeatures: {
    marginTop: spacing.s2,
  },
  blocks: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.s6,
  },
  code: {
    alignItems: 'flex-start',
    borderColor: colors.border,
    borderRadius: radius.base,
    borderStyle: 'solid',
    borderWidth: 1,
    columnGap: spacing.s3,
    display: 'flex',
    padding: spacing.s3,
  },
  codeText: {
    flexGrow: 1,
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    fontSize: 13,
    lineHeight: 1.7,
    margin: 0,
    minWidth: 0,
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  copy: {
    backgroundColor: 'transparent',
    borderRadius: radius.base,
    borderStyle: 'none',
    color: {
      ':hover': colors.fg,
      default: colors.muted,
    },
    cursor: 'pointer',
    flexShrink: 0,
    fontFamily: 'inherit',
    fontSize: 13,
    lineHeight: 1.7,
    outlineColor: colors.fg,
    outlineOffset: 2,
    outlineStyle: {
      ':focus-visible': 'solid',
      default: 'none',
    },
    outlineWidth: 2,
    padding: 0,
  },
  feature: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.s1,
  },
  featureDetail: {
    color: colors.muted,
    fontSize: font.sizeSm,
    margin: 0,
  },
  featureName: {
    fontWeight: font.weightMedium,
  },
  features: {
    columnGap: spacing.s8,
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      [WIDE]: '1fr 1fr',
    },
    margin: 0,
    rowGap: spacing.s6,
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
  limits: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.s2,
    margin: 0,
    paddingInlineStart: spacing.s4,
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
  // Read by screen readers, never drawn.
  live: {
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1,
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
  seen: {
    borderColor: colors.border,
    borderRadius: radius.base,
    borderStyle: 'solid',
    borderWidth: 1,
    columnGap: spacing.s4,
    display: 'grid',
    fontSize: font.sizeSm,
    gridTemplateColumns: 'max-content 1fr',
    margin: 0,
    padding: spacing.s3,
    rowGap: spacing.s1,
  },
  seenLabel: {
    color: colors.muted,
  },
  seenTitle: {
    color: colors.muted,
    fontSize: font.sizeSm,
    margin: 0,
  },
  seenValue: {
    fontVariantNumeric: 'tabular-nums',
    margin: 0,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
  self: {
    alignSelf: 'flex-start',
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
  tryButton: {
    backgroundColor: {
      ':hover': colors.fg,
      default: colors.bg,
    },
    borderColor: colors.fg,
    borderRadius: radius.base,
    borderStyle: 'solid',
    borderWidth: 1,
    color: {
      ':hover': colors.bg,
      default: colors.fg,
    },
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: font.sizeSm,
    lineHeight: 1.4,
    paddingBlock: spacing.s2,
    paddingInline: spacing.s3,
    transitionDuration: '150ms',
    transitionProperty: 'background-color, color',
  },
  tryButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.s2,
  },
  wordmark: {
    fontSize: 19,
    fontWeight: font.weightMedium,
    letterSpacing: '-0.01em',
    margin: 0,
  },
});

function Feature({ detail, name }: { detail: string; name: string }) {
  return (
    <div {...props(styles.feature)}>
      <dt {...props(styles.featureName)}>{name}</dt>
      <dd {...props(styles.featureDetail)}>{detail}</dd>
    </div>
  );
}

/**
 * Turns the knobs for one button, through the public API only, and opens the
 * panel so the visitor sees the row it set and its `×`.
 */
function runDemo(demo: Demo) {
  track('try_click', { demo });
  if (demo === 'reset') {
    reset();
    return;
  }
  setState({ ...DEMOS[demo](), panel: { open: true } });
}

/**
 * Inside a device's frame this page runs a second time, and the copy of
 * devknobs there only follows the page above. So a button pressed on the phone
 * screen hands the click up to the page that owns the panel.
 */
function pressDemo(demo: Demo) {
  let owner: Window['knobsDemo'];
  try {
    owner = window.parent === window ? undefined : window.parent.knobsDemo;
  } catch {
    // A parent on another origin, such as an embed, answers with an error.
    owner = undefined;
  }
  (owner ?? runDemo)(demo);
}

function TryButton({ demo, label }: { demo: Demo; label: string }) {
  return (
    <button {...props(styles.tryButton)} onClick={() => pressDemo(demo)} type="button">
      {label}
    </button>
  );
}

type Seen = {
  language: string;
  pointer: string;
  scheme: string;
  time: string;
  width: string;
  zone: string;
};

/** What the page's own code reads right now, so each knob shows up as a value. */
function readSeen(): Seen {
  const format = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    weekday: 'short',
  });
  return {
    language: navigator.language,
    pointer: matchMedia('(pointer: coarse)').matches
      ? m.seen_pointer_touch()
      : m.seen_pointer_mouse(),
    scheme: matchMedia('(prefers-color-scheme: dark)').matches
      ? m.seen_scheme_dark()
      : m.seen_scheme_light(),
    time: format.format(new Date()),
    width: m.seen_width_value({ width: String(window.innerWidth) }),
    zone: format.resolvedOptions().timeZone,
  };
}

function SeenRow({ label, value }: { label: string; value: string | undefined }) {
  return (
    <>
      <dt {...props(styles.seenLabel)}>{label}</dt>
      <dd {...props(styles.seenValue)}>{value}</dd>
    </>
  );
}

function SeenList() {
  // Empty on the server and on the first client render, so hydration matches.
  const [seen, setSeen] = useState<Seen | null>(null);
  useEffect(() => {
    const update = () => setSeen(readSeen());
    update();
    const timer = setInterval(update, 1000);
    window.addEventListener('resize', update);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', update);
    };
  }, []);
  return (
    <dl {...props(styles.seen)}>
      <SeenRow label={m.seen_width()} value={seen?.width} />
      <SeenRow label={m.seen_time()} value={seen?.time} />
      <SeenRow label={m.seen_zone()} value={seen?.zone} />
      <SeenRow label={m.seen_language()} value={seen?.language} />
      <SeenRow label={m.seen_scheme()} value={seen?.scheme} />
      <SeenRow label={m.seen_pointer()} value={seen?.pointer} />
    </dl>
  );
}

/**
 * A code box with a copy button at its right edge. The code stays plain text,
 * selectable by hand. Where the clipboard refuses the write (an insecure
 * context, an old browser), the code is selected instead, ready to copy.
 */
function CodeBox({
  code,
  copyLabel,
  name,
  style,
}: {
  code: string;
  copyLabel: string;
  name: string;
  style?: StyleXStyles;
}) {
  const [copied, setCopied] = useState(false);
  const text = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = () => {
    track('copy_click', { snippet: name });
    navigator.clipboard.writeText(code).then(
      () => setCopied(true),
      () => {
        if (text.current !== null) {
          getSelection()?.selectAllChildren(text.current);
        }
      },
    );
  };
  return (
    <div {...props(styles.code, style)}>
      <pre {...props(styles.codeText)} ref={text}>
        {code}
      </pre>
      <button {...props(styles.copy)} aria-label={copyLabel} onClick={copy} type="button">
        {copied ? m.copy_done() : m.copy_action()}
      </button>
      <span {...props(styles.live)} aria-live="polite">
        {copied ? m.copy_done() : ''}
      </span>
    </div>
  );
}

function Snippet({
  code,
  copyLabel,
  label,
  name,
}: {
  code: string;
  copyLabel: string;
  label: string;
  name: string;
}) {
  return (
    <div {...props(styles.snippet)}>
      <span {...props(styles.snippetLabel)}>{label}</span>
      <CodeBox code={code} copyLabel={copyLabel} name={name} />
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
    // Buttons, and the search results, which are options rather than buttons.
    // The fields are inputs, and a click on the panel's own chrome hits nothing.
    const control = target.closest('button, [role="option"]');
    if (control === null) {
      return;
    }
    // A row and a result carry their value in a span of its own; the handle,
    // `×` and the switches carry it as text or an aria-label.
    const text = (control.querySelector('.row-label, .entry-value') ?? control).textContent?.trim();
    track('knob_click', {
      control:
        (text === undefined || text === '' ? control.getAttribute('aria-label') : text) ??
        undefined,
      // The knob inside an open row's editor, or the knob a search result sets.
      group: (
        control.closest('.knob')?.querySelector('.knob-label') ??
        control.querySelector('.entry-knob, .entry-name')
      )?.textContent?.trim(),
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
  // edge tab the hero points at, and stays open across the reloads the device
  // and locale knobs cause once a visitor opens it.
  useEffect(() => {
    mount();
    // The copy of this page inside a device's frame hands its buttons up here.
    window.knobsDemo = runDemo;
    // One delegated listener for the whole page, panel included. Passive: it
    // never cancels the click it is reading.
    document.addEventListener('click', trackClick, { passive: true });
    return () => {
      document.removeEventListener('click', trackClick);
      delete window.knobsDemo;
      unmount();
    };
  }, []);

  return (
    <main {...props(styles.page)}>
      <header {...props(styles.section)}>
        <h1 {...props(styles.wordmark)}>{m.app_name()}</h1>
        <p {...props(styles.text)}>{m.tagline()}</p>
        <CodeBox
          code={m.install_command()}
          copyLabel={m.copy_install()}
          name="install"
          style={styles.installCode}
        />
        <p {...props(styles.hint)}>{m.hero_hint()}</p>
      </header>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.how_title()}</h2>
        <p {...props(styles.text)}>{m.how_frame()}</p>
        <p {...props(styles.text)}>{m.how_patch()}</p>
        <p {...props(styles.text)}>{m.how_setup()}</p>
      </section>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.try_title()}</h2>
        <p {...props(styles.text)}>{m.try_intro()}</p>
        <div {...props(styles.tryButtons)}>
          <TryButton demo="iphone" label={m.try_iphone()} />
          <TryButton demo="pixel" label={m.try_pixel()} />
          <TryButton demo="tomorrow" label={m.try_tomorrow()} />
          <TryButton demo="scheme" label={m.try_scheme()} />
          <TryButton demo="arabic" label={m.try_arabic()} />
          <TryButton demo="reset" label={m.try_reset()} />
        </div>
        <p {...props(styles.seenTitle)}>{m.seen_title()}</p>
        <SeenList />
      </section>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.grab_title()}</h2>
        <p {...props(styles.text)}>{m.grab_intro()}</p>
        <p {...props(styles.text)}>{m.grab_try()}</p>
        <Snippet
          code={m.grab_example_code()}
          copyLabel={m.copy_grab_example()}
          label={m.grab_example_label()}
          name="grab_example"
        />
        <p {...props(styles.text)}>{m.grab_context()}</p>
        <ul {...props(styles.limits)}>
          <li>{m.grab_key_copy()}</li>
          <li>{m.grab_key_arrows()}</li>
          <li>{m.grab_key_shift()}</li>
          <li>{m.grab_key_escape()}</li>
        </ul>
        <p {...props(styles.text)}>{m.grab_lines()}</p>
        <p {...props(styles.text)}>{m.grab_frame()}</p>
        <p {...props(styles.text)}>{m.grab_replace()}</p>
        <Snippet
          code={m.grab_api_code()}
          copyLabel={m.copy_grab_api()}
          label={m.grab_api_label()}
          name="grab_api"
        />
        <p {...props(styles.note)}>
          {m.grab_credit_built()}{' '}
          <a href="https://github.com/aidenybai/react-grab" {...props(styles.link)}>
            {m.grab_credit_react_grab()}
          </a>{' '}
          {m.grab_credit_by()}{' '}
          <a href="https://github.com/aidenybai/bippy" {...props(styles.link)}>
            {m.grab_credit_bippy()}
          </a>
          {', '}
          {m.grab_credit_carries()}{' '}
          <a href="https://github.com/jridgewell/sourcemaps" {...props(styles.link)}>
            {m.grab_credit_sourcemap()}
          </a>{' '}
          {m.grab_credit_end()}{' '}
          <a href={NOTICES} {...props(styles.link)}>
            {m.grab_credit_notices()}
          </a>
        </p>
      </section>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.features_title()}</h2>
        <dl {...props(styles.features)}>
          <Feature detail={m.feature_devices_detail()} name={m.feature_devices()} />
          <Feature detail={m.feature_touch_detail()} name={m.feature_touch()} />
          <Feature detail={m.feature_time_detail()} name={m.feature_time()} />
          <Feature detail={m.feature_language_detail()} name={m.feature_language()} />
          <Feature detail={m.feature_look_detail()} name={m.feature_look()} />
          <Feature detail={m.feature_debug_detail()} name={m.feature_debug()} />
        </dl>
        <p {...props(styles.text, styles.afterFeatures)}>{m.features_panel()}</p>
        <a href="https://github.com/mertbuilds/devknobs#knobs" {...props(styles.link, styles.self)}>
          {m.features_readme()}
        </a>
      </section>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.usage_title()}</h2>
        <div {...props(styles.blocks)}>
          <Snippet
            code={m.usage_script_code()}
            copyLabel={m.copy_script()}
            label={m.usage_script_label()}
            name="script"
          />
          <Snippet
            code={m.usage_import_code()}
            copyLabel={m.copy_import()}
            label={m.usage_import_label()}
            name="import"
          />
          <Snippet
            code={m.usage_react_code()}
            copyLabel={m.copy_react()}
            label={m.usage_react_label()}
            name="react"
          />
        </div>
        <p {...props(styles.note)}>{m.usage_react_note()}</p>
        <Snippet
          code={m.usage_early_code()}
          copyLabel={m.copy_early()}
          label={m.usage_early_label()}
          name="early"
        />
        <p {...props(styles.note)}>{m.usage_early_note()}</p>
      </section>

      <section {...props(styles.section)}>
        <h2 {...props(styles.sectionHeading)}>{m.limits_title()}</h2>
        <ul {...props(styles.limits)}>
          <li>{m.limits_ua()}</li>
          <li>{m.limits_touch()}</li>
          <li>{m.limits_phone()}</li>
          <li>{m.limits_clock()}</li>
          <li>{m.limits_devtools()}</li>
        </ul>
        <p {...props(styles.note)}>
          {m.limits_bezels()}{' '}
          <a href={NOTICES} {...props(styles.link)}>
            {m.limits_bezels_link()}
          </a>
        </p>
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
