import { colors, font, spacing } from '@knobs/ui/tokens.stylex';
import { create, props } from '@stylexjs/stylex';
import { createFileRoute } from '@tanstack/react-router';
import { m } from '../paraglide/messages.js';

export const Route = createFileRoute('/')({
  component: Landing,
});

const styles = create({
  main: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    color: colors.fg,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: font.family,
    gap: spacing.s2,
    justifyContent: 'center',
    minHeight: '100vh',
    paddingInline: spacing.s4,
  },
  title: {
    fontSize: 40,
    fontWeight: font.weightBold,
    letterSpacing: '-0.02em',
    margin: 0,
    textWrap: 'balance',
  },
});

function Landing() {
  return (
    <main {...props(styles.main)}>
      <h1 {...props(styles.title)}>{m.app_name()}</h1>
    </main>
  );
}
