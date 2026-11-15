import { NoticeTemplateProps } from "./types";

const LED_COLORS = ["#ffd76a", "#7affc1", "#ff9ad1"];

const BASE_CLASS =
  "tw:relative tw:flex tw:w-full tw:items-center tw:gap-3 tw:rounded-2xl tw:border-0 tw:bg-[#d8343a] tw:px-3 tw:py-2.5 tw:text-left tw:text-white tw:shadow-[inset_0_-4px_0_rgba(0,0,0,0.18)] tw:transition-[filter]";
const INTERACTIVE_CLASS = "tw:cursor-pointer tw:hover:brightness-105";

export const PokedexBanner: React.FC<NoticeTemplateProps> = ({
  tag,
  title,
  body,
  cta,
  ctaIcon,
  onActivate,
}) => {
  const content = (
    <>
      {tag && (
        <span className="tw:absolute tw:-top-2.5 tw:left-3 tw:rounded-md tw:bg-[#ffd76a] tw:px-2 tw:py-0.5 tw:text-[10px] tw:font-extrabold tw:tracking-[0.08em] tw:text-[#111]">
          {tag}
        </span>
      )}
      <span className="tw:absolute tw:top-1.5 tw:right-3 tw:flex tw:gap-1" aria-hidden>
        {LED_COLORS.map((color) => (
          <i
            key={color}
            className="tw:block tw:size-1.5 tw:rounded-full"
            style={{ background: color }}
          />
        ))}
      </span>
      <span
        aria-hidden
        className="tw:size-10 tw:shrink-0 tw:rounded-full tw:border-[3px] tw:border-white tw:bg-[radial-gradient(circle_at_35%_35%,#bfe8ff,#3a9de2_55%,#1d5f99)] tw:shadow-[0_0_0_2px_#a8232a]"
      />
      <span className="tw:min-w-0 tw:flex-1 tw:rounded-lg tw:border-2 tw:border-[#a8232a] tw:bg-[#dff3d8] tw:px-2.5 tw:py-1.5 tw:font-mono tw:text-[#16361a] tw:dark:border-[#7a1a1f] tw:dark:bg-[#1d3320] tw:dark:text-[#b8f0b0]">
        <span className="tw:block tw:text-[13px] tw:font-bold tw:uppercase">
          {title}
        </span>
        {body && (
          <span className="tw:block tw:text-[11px] tw:text-[#3d6b40] tw:dark:text-[#7fbf80]">
            {body}
          </span>
        )}
      </span>
      {onActivate && cta && (
        <span className="tw:flex tw:shrink-0 tw:items-center tw:gap-1.5 tw:rounded-full tw:bg-[#111] tw:px-2.5 tw:py-1.5 tw:text-xs tw:font-bold tw:whitespace-nowrap tw:text-white tw:dark:bg-[#f5f5f5] tw:dark:text-[#111]">
          {ctaIcon && (
            <span
              aria-hidden
              className="tw:flex tw:size-4 tw:items-center tw:justify-center tw:rounded-full tw:bg-white"
            >
              {ctaIcon}
            </span>
          )}
          {cta}
        </span>
      )}
    </>
  );

  // The tag overhangs the top edge; reserve its height so callers can space
  // the banner by its visible edge.
  const className = `${BASE_CLASS} ${tag ? "tw:mt-2.5" : ""}`;

  if (!onActivate) return <div className={className}>{content}</div>;
  return (
    <button
      type="button"
      onClick={onActivate}
      className={`${className} ${INTERACTIVE_CLASS}`}
    >
      {content}
    </button>
  );
};
