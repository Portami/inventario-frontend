import {OFFER_STATE_META, OFFER_TRANSITIONS} from '@/pages/constants/offerConstants';
import {OfferState} from '@/types/offerte';
import CheckIcon from '@mui/icons-material/Check';
import {Box, useTheme} from '@mui/material';
import {Theme} from '@mui/material/styles';

const R = 15;
const COL_W = 112;
const TOP_Y = 36;
const BOT_Y = 100;
const LBL_TOP = TOP_Y + R + 14;
const LBL_BOT = BOT_Y + R + 14;

function Node({
    state,
    cx,
    cy,
    labelY,
    kind,
    theme,
}: {
    state: OfferState;
    cx: number;
    cy: number;
    labelY: number;
    kind: 'done' | 'current' | 'next';
    theme: Theme;
}) {
    const meta = OFFER_STATE_META[state];
    const primary = theme.palette.primary.main;

    const fill = kind === 'next' ? '#fff' : primary;
    const stroke = kind === 'next' ? meta.color : primary;
    const dashes = kind === 'next' ? '5 3' : undefined;
    const iconClr = kind === 'next' ? meta.color : '#fff';
    const lblClr = kind === 'current' ? primary : kind === 'done' ? '#bbb' : meta.color;

    return (
        <g>
            {kind === 'current' && <circle cx={cx} cy={cy} r={R + 7} fill={`${primary}12`} stroke="none" />}
            <circle cx={cx} cy={cy} r={R} fill={fill} stroke={stroke} strokeWidth={2} strokeDasharray={dashes} />
            <foreignObject x={cx - R + 4} y={cy - R + 4} width={(R - 4) * 2} height={(R - 4) * 2}>
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: iconClr,
                    }}
                >
                    {kind === 'done' ? <CheckIcon sx={{fontSize: R * 1.1}} /> : <meta.Icon sx={{fontSize: R * 1.1}} />}
                </Box>
            </foreignObject>
            <text
                x={cx}
                y={labelY}
                textAnchor="middle"
                fontSize={9.5}
                fontWeight={kind === 'current' ? 700 : 400}
                fill={lblClr}
                fontFamily="Helvetica, Arial, sans-serif"
            >
                {meta.label}
            </text>
        </g>
    );
}

interface Props {
    visitedPath: OfferState[];
    currentState: OfferState;
}

export default function OfferFlowDiagram({visitedPath, currentState}: Props) {
    const theme = useTheme();
    const primary = theme.palette.primary.main;

    const done = visitedPath.filter((s) => s !== currentState);
    const nexts = OFFER_TRANSITIONS[currentState];
    const next0 = nexts[0] ?? null;
    const next1 = nexts[1] ?? null;

    const curIdx = done.length;
    const next0Idx = curIdx + 1;
    const cols = done.length + 1 + (next0 ? 1 : 0);

    const cx = (i: number) => i * COL_W + COL_W / 2;
    const curCx = cx(curIdx);
    const n0Cx = next0 ? cx(next0Idx) : 0;

    const SVG_W = cols * COL_W;
    const SVG_H = next1 ? LBL_BOT + 14 : LBL_TOP + 14;

    return (
        <Box sx={{overflowX: 'auto', py: 0.5}}>
            <svg width={SVG_W} height={SVG_H} style={{display: 'block', overflow: 'visible'}}>
                {/* Solid lines between consecutive done states */}
                {done.map((_, i) =>
                    i === 0 ? null : <line key={`dl-${i}`} x1={cx(i - 1) + R} y1={TOP_Y} x2={cx(i) - R} y2={TOP_Y} stroke={primary} strokeWidth={2} />,
                )}

                {/* Solid line from last done → current */}
                {done.length > 0 && <line x1={cx(done.length - 1) + R} y1={TOP_Y} x2={curCx - R} y2={TOP_Y} stroke={primary} strokeWidth={2} />}

                {/* Dashed line current → next0 (main branch, top) */}
                {next0 && (
                    <line
                        x1={curCx + R}
                        y1={TOP_Y}
                        x2={n0Cx - R}
                        y2={TOP_Y}
                        stroke={`${OFFER_STATE_META[next0].color}60`}
                        strokeWidth={1.5}
                        strokeDasharray="5 3"
                    />
                )}

                {/* Dashed diagonal current → next1 (alt branch, bottom) */}
                {next1 && (
                    <line
                        x1={curCx + R}
                        y1={TOP_Y}
                        x2={n0Cx - R}
                        y2={BOT_Y}
                        stroke={`${OFFER_STATE_META[next1].color}60`}
                        strokeWidth={1.5}
                        strokeDasharray="5 3"
                    />
                )}

                {/* Done nodes */}
                {done.map((s, i) => (
                    <Node key={s} state={s} cx={cx(i)} cy={TOP_Y} labelY={LBL_TOP} kind="done" theme={theme} />
                ))}

                {/* Current node */}
                <Node state={currentState} cx={curCx} cy={TOP_Y} labelY={LBL_TOP} kind="current" theme={theme} />

                {/* Next0 - top row */}
                {next0 && <Node state={next0} cx={n0Cx} cy={TOP_Y} labelY={LBL_TOP} kind="next" theme={theme} />}

                {/* Next1 - lower branch */}
                {next1 && <Node state={next1} cx={n0Cx} cy={BOT_Y} labelY={LBL_BOT} kind="next" theme={theme} />}
            </svg>
        </Box>
    );
}
