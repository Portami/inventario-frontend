import StatTile from '@/components/offers/StatTile';
import ChartCard from '@/components/statistics/ChartCard';
import {useOffers} from '@/hooks/useOffers';
import {ALL_BACKEND_STATES, fmtCHF, OFFER_STATE_META} from '@/pages/constants/offerConstants';
import type {OfferState, OfferSummaryDto} from '@/types/offerte';
import {Alert, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {useMemo} from 'react';
import {Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

const DUNNING_STATES: OfferState[] = ['PAYMENT_REMINDER', 'FIRST_DUNNING_NOTICE', 'SECOND_DUNNING_NOTICE'];
const TICK_STYLE = {fontSize: 11, fill: '#505D68'};

function fmtMonth(key: string) {
    return new Date(key + '-01').toLocaleDateString('de-CH', {month: 'short', year: '2-digit'});
}

function fmtMonthLong(key: string) {
    return new Date(key + '-01').toLocaleDateString('de-CH', {month: 'long', year: 'numeric'});
}

function accumulateOffer(
    o: OfferSummaryDto,
    now: Date,
    acc: {
        totals: {totalRevenue: number; pipelineValue: number; completedCount: number; closedCount: number; overdueCount: number; overdueValue: number};
        monthBuckets: Map<string, {paid: number; open: number}>;
        stateCounts: Map<OfferState, number>;
        customerRevenue: Map<string, {revenue: number; count: number}>;
        customerLoss: Map<string, {lostCount: number; lostValue: number}>;
        overdueByState: Map<OfferState, {value: number; count: number}>;
        volumeCreated: Map<string, number>;
        volumeCompleted: Map<string, number>;
    },
) {
    const isClosed = o.state === 'CANCELLED' || o.state === 'NO_RESPONSE';
    const isCompleted = o.state === 'COMPLETED';
    const isActive = !isClosed && !isCompleted;
    const {totals, monthBuckets, stateCounts, customerRevenue, customerLoss, overdueByState, volumeCreated, volumeCompleted} = acc;

    if (isCompleted) {
        totals.totalRevenue += o.total;
        totals.completedCount++;
    } else if (isClosed) {
        totals.closedCount++;
    } else {
        totals.pipelineValue += o.total;
    }

    if (o.overdue > 0 && isActive) {
        totals.overdueCount++;
        totals.overdueValue += o.total;
        const g = overdueByState.get(o.state) ?? {value: 0, count: 0};
        overdueByState.set(o.state, {value: g.value + o.total, count: g.count + 1});
    }

    const monthKey = o.createdISO.substring(0, 7);
    const bucket = monthBuckets.get(monthKey) ?? {paid: 0, open: 0};
    monthBuckets.set(monthKey, bucket);
    if (isCompleted) {
        bucket.paid += o.total;
    } else if (isActive) {
        bucket.open += o.total;
    }

    stateCounts.set(o.state, (stateCounts.get(o.state) ?? 0) + 1);

    if (isClosed) {
        const e = customerLoss.get(o.customer) ?? {lostCount: 0, lostValue: 0};
        customerLoss.set(o.customer, {lostCount: e.lostCount + 1, lostValue: e.lostValue + o.total});
    } else {
        const e = customerRevenue.get(o.customer) ?? {revenue: 0, count: 0};
        customerRevenue.set(o.customer, {revenue: e.revenue + o.total, count: e.count + 1});
    }

    const created = new Date(o.createdISO + 'T00:00:00');
    const monthsDiff = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
    if (monthsDiff < 12) {
        volumeCreated.set(monthKey, (volumeCreated.get(monthKey) ?? 0) + 1);
        if (isCompleted) {
            volumeCompleted.set(monthKey, (volumeCompleted.get(monthKey) ?? 0) + 1);
        }
    }
}

function computeStats(offers: OfferSummaryDto[]) {
    const now = new Date();
    const totals = {totalRevenue: 0, pipelineValue: 0, completedCount: 0, closedCount: 0, overdueCount: 0, overdueValue: 0};
    const monthBuckets = new Map<string, {paid: number; open: number}>();
    const stateCounts = new Map<OfferState, number>();
    const customerRevenue = new Map<string, {revenue: number; count: number}>();
    const customerLoss = new Map<string, {lostCount: number; lostValue: number}>();
    const overdueByState = new Map<OfferState, {value: number; count: number}>();
    const volumeCreated = new Map<string, number>();
    const volumeCompleted = new Map<string, number>();
    const acc = {totals, monthBuckets, stateCounts, customerRevenue, customerLoss, overdueByState, volumeCreated, volumeCompleted};

    for (const o of offers) accumulateOffer(o, now, acc);

    const {totalRevenue, pipelineValue, completedCount, closedCount, overdueCount, overdueValue} = totals;
    const conversionRate = completedCount + closedCount > 0 ? Math.round((completedCount / (completedCount + closedCount)) * 100) : 0;
    const avgValue = offers.length > 0 ? offers.reduce((s, o) => s + o.total, 0) / offers.length : 0;

    const monthlyData = [...monthBuckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => ({month: key, label: fmtMonth(key), ...v}));

    const statePieData = ALL_BACKEND_STATES.filter((s) => (stateCounts.get(s) ?? 0) > 0).map((s) => ({
        name: OFFER_STATE_META[s].label,
        value: stateCounts.get(s) ?? 0,
        color: OFFER_STATE_META[s].color,
    }));

    const top5Customers = [...customerRevenue.entries()]
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 5)
        .map(([customer, v]) => ({customer, ...v}));

    const overdueData = DUNNING_STATES.filter((s) => overdueByState.has(s)).map((s) => {
        const entry = overdueByState.get(s) ?? {value: 0, count: 0};
        return {label: OFFER_STATE_META[s].label, value: entry.value, count: entry.count, color: OFFER_STATE_META[s].color};
    });

    const last12Months: string[] = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last12Months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    const volumeTrendData = last12Months.map((key) => ({
        label: fmtMonth(key),
        created: volumeCreated.get(key) ?? 0,
        completed: volumeCompleted.get(key) ?? 0,
    }));

    const topCompletedCustomers = [...customerRevenue.entries()]
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .slice(0, 8)
        .map(([customer, v]) => ({customer, completedRevenue: v.revenue, completedCount: v.count, lostCount: customerLoss.get(customer)?.lostCount ?? 0}));

    const riskCustomers = [...customerLoss.entries()]
        .sort(([, a], [, b]) => b.lostCount - a.lostCount)
        .slice(0, 8)
        .map(([customer, v]) => ({customer, lostCount: v.lostCount, lostValue: v.lostValue, completedCount: customerRevenue.get(customer)?.count ?? 0}));

    return {
        kpis: {totalRevenue, pipelineValue, conversionRate, overdueCount, overdueValue, avgValue},
        monthlyData,
        statePieData,
        top5Customers,
        overdueData,
        overdueCount,
        totalOffers: offers.length,
        volumeTrendData,
        topCompletedCustomers,
        riskCustomers,
    };
}

export default function StatisticsPage() {
    const {offers, loading} = useOffers();
    const stats = useMemo(() => computeStats(offers), [offers]);

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', py: 10}}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    const {kpis, monthlyData, statePieData, top5Customers, overdueData, overdueCount, totalOffers, volumeTrendData, topCompletedCustomers, riskCustomers} =
        stats;

    return (
        <Box sx={{py: 4}}>
            {/* Header */}
            <Box sx={{mb: 3}}>
                <Typography variant="caption" color="text.secondary" sx={{textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600}}>
                    Inventar
                </Typography>
                <Typography variant="h4" sx={{fontWeight: 600, mt: 0.25, color: 'text.primary'}}>
                    Statistiken
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                    Übersicht über Umsatz, Kunden und Offerten-Status.
                </Typography>
            </Box>

            {/* KPI tiles */}
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, mb: 3}}>
                <StatTile
                    label="Gesamtumsatz"
                    value={fmtCHF(kpis.totalRevenue)}
                    sub="abgeschlossene Offerten"
                    color="#2e7d32"
                    active={false}
                    onClick={() => {}}
                />
                <StatTile label="Pipeline-Wert" value={fmtCHF(kpis.pipelineValue)} sub="aktive Offerten" color="#7D55C7" active={false} onClick={() => {}} />
                <StatTile label="Conversion Rate" value={`${kpis.conversionRate}%`} sub="Offerte → Bezahlt" color="#0288d1" active={false} onClick={() => {}} />
                <StatTile
                    label="Überfällig"
                    value={kpis.overdueCount}
                    sub={kpis.overdueCount > 0 ? fmtCHF(kpis.overdueValue) : 'keine offenen Fälle'}
                    color={kpis.overdueCount > 0 ? '#c62828' : undefined}
                    active={false}
                    onClick={() => {}}
                />
                <StatTile label="Ø Auftragswert" value={fmtCHF(kpis.avgValue)} sub={`aus ${totalOffers} Offerten`} active={false} onClick={() => {}} />
            </Box>

            {/* Charts row 1: Revenue bar + State donut */}
            <Box sx={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, mb: 2}}>
                <ChartCard title="Monatlicher Umsatz" subtitle="Bezahlte und offene Offerten pro Monat">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={monthlyData} margin={{top: 4, right: 8, left: 0, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                            <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={TICK_STYLE}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                                width={40}
                            />
                            <Tooltip
                                formatter={(value: number) => fmtCHF(value)}
                                labelFormatter={(label: string) => {
                                    const entry = monthlyData.find((d) => d.label === label);
                                    return entry ? fmtMonthLong(entry.month) : label;
                                }}
                                contentStyle={{fontSize: 12, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)'}}
                            />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: 11, paddingTop: 8}} />
                            <Bar dataKey="paid" name="Bezahlt" stackId="a" fill="#2e7d32" />
                            <Bar dataKey="open" name="Offen" stackId="a" fill="#7D55C7" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Offerten nach Status" subtitle="Aktuelle Verteilung">
                    <Box sx={{position: 'relative'}}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={statePieData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} dataKey="value" strokeWidth={0}>
                                    {statePieData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number, name: string) => [`${value} Offerten`, name]}
                                    contentStyle={{fontSize: 12, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)'}}
                                />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: 11}} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Centered total count */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '43%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                pointerEvents: 'none',
                            }}
                        >
                            <Typography sx={{fontSize: 22, fontWeight: 700, lineHeight: 1, color: 'text.primary'}}>{totalOffers}</Typography>
                            <Typography sx={{fontSize: 10, color: 'text.secondary', mt: 0.25}}>Total</Typography>
                        </Box>
                    </Box>
                </ChartCard>
            </Box>

            {/* Chart 3: Top 5 customers */}
            {top5Customers.length > 0 && (
                <ChartCard title="Top 5 Kunden nach Umsatz" subtitle="Kumulierter Offertenwert (ohne Absagen)" sx={{mb: 2}}>
                    <ResponsiveContainer width="100%" height={Math.max(160, top5Customers.length * 44)}>
                        <BarChart layout="vertical" data={top5Customers} margin={{top: 0, right: 60, left: 0, bottom: 0}}>
                            <XAxis
                                type="number"
                                tick={TICK_STYLE}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                            />
                            <YAxis
                                type="category"
                                dataKey="customer"
                                tick={{fontSize: 12, fontWeight: 600, fill: '#23254f'}}
                                width={140}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={(value: number) => [fmtCHF(value), 'Umsatz']}
                                contentStyle={{fontSize: 12, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)'}}
                            />
                            <Bar dataKey="revenue" name="Umsatz" fill="#7D55C7" radius={[0, 4, 4, 0]}>
                                {top5Customers.map((entry) => (
                                    <Cell key={entry.customer} fill="#7D55C7" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}

            {/* Chart 4: Overdue at risk */}
            <ChartCard title="Offerten mit Zahlungsverzug" subtitle="Ausstehender Betrag nach Mahnstufe" sx={{mb: 2}}>
                {overdueCount === 0 ? (
                    <Alert severity="success" sx={{fontSize: 13}}>
                        Keine überfälligen Offerten - alles im grünen Bereich.
                    </Alert>
                ) : (
                    <ResponsiveContainer width="100%" height={Math.max(120, overdueData.length * 52)}>
                        <BarChart layout="vertical" data={overdueData} margin={{top: 0, right: 60, left: 0, bottom: 0}}>
                            <XAxis
                                type="number"
                                tick={TICK_STYLE}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                            />
                            <YAxis
                                type="category"
                                dataKey="label"
                                tick={{fontSize: 12, fontWeight: 600, fill: '#23254f'}}
                                width={160}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                formatter={(value: number) => [fmtCHF(value), 'Ausstehend']}
                                contentStyle={{fontSize: 12, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)'}}
                            />
                            <Bar dataKey="value" name="Ausstehend" radius={[0, 4, 4, 0]}>
                                {overdueData.map((entry) => (
                                    <Cell key={entry.label} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </ChartCard>

            {/* Customer stats tables */}
            {(topCompletedCustomers.length > 0 || riskCustomers.length > 0) && (
                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2}}>
                    <ChartCard title="Beste Kunden" subtitle="Höchster bezahlter Umsatz">
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {['Kunde', 'Abgeschlossen', 'Umsatz'].map((h) => (
                                            <TableCell
                                                key={h}
                                                sx={{
                                                    fontSize: 10.5,
                                                    fontWeight: 600,
                                                    letterSpacing: '0.05em',
                                                    textTransform: 'uppercase',
                                                    color: 'text.secondary',
                                                    px: 1,
                                                    py: 0.75,
                                                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                                                }}
                                            >
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topCompletedCustomers.map((c, i) => (
                                        <TableRow key={c.customer} sx={{'& td': {px: 1, py: 0.75, fontSize: 13, borderBottom: '1px solid rgba(0,0,0,0.04)'}}}>
                                            <TableCell sx={{fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#2e7d32' : 'text.primary'}}>
                                                {i === 0 && '★ '}
                                                {c.customer}
                                            </TableCell>
                                            <TableCell sx={{color: 'text.secondary', fontVariantNumeric: 'tabular-nums'}}>{c.completedCount}×</TableCell>
                                            <TableCell sx={{fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#2e7d32'}}>
                                                {fmtCHF(c.completedRevenue)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </ChartCard>

                    <ChartCard title="Kunden mit Vorsicht" subtitle="Meiste Absagen und keine Rückmeldungen">
                        {riskCustomers.length === 0 ? (
                            <Alert severity="success" sx={{fontSize: 13}}>
                                Keine problematischen Kunden - alle laufen gut.
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {['Kunde', 'Absagen', 'Abgeschl.'].map((h) => (
                                                <TableCell
                                                    key={h}
                                                    sx={{
                                                        fontSize: 10.5,
                                                        fontWeight: 600,
                                                        letterSpacing: '0.05em',
                                                        textTransform: 'uppercase',
                                                        color: 'text.secondary',
                                                        px: 1,
                                                        py: 0.75,
                                                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                                                    }}
                                                >
                                                    {h}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {riskCustomers.map((c) => (
                                            <TableRow
                                                key={c.customer}
                                                sx={{'& td': {px: 1, py: 0.75, fontSize: 13, borderBottom: '1px solid rgba(0,0,0,0.04)'}}}
                                            >
                                                <TableCell sx={{fontWeight: 600, color: c.completedCount === 0 ? '#c62828' : 'text.primary'}}>
                                                    {c.completedCount === 0 && '⚠ '}
                                                    {c.customer}
                                                </TableCell>
                                                <TableCell sx={{fontVariantNumeric: 'tabular-nums', color: '#c62828', fontWeight: 600}}>
                                                    {c.lostCount}×
                                                </TableCell>
                                                <TableCell sx={{color: 'text.secondary', fontVariantNumeric: 'tabular-nums'}}>{c.completedCount}×</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </ChartCard>
                </Box>
            )}

            {/* Chart 5: Volume trend */}
            <ChartCard title="Offerten-Volumen" subtitle="Erstellte und abgeschlossene Offerten – letzte 12 Monate">
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={volumeTrendData} margin={{top: 4, right: 8, left: 0, bottom: 0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                        <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={TICK_STYLE} axisLine={false} tickLine={false} width={28} />
                        <Tooltip contentStyle={{fontSize: 12, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)'}} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: 11, paddingTop: 8}} />
                        <Line type="monotone" dataKey="created" name="Erstellt" stroke="#7D55C7" strokeWidth={2} dot={false} connectNulls />
                        <Line type="monotone" dataKey="completed" name="Abgeschlossen" stroke="#2e7d32" strokeWidth={2} dot={false} connectNulls />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>
        </Box>
    );
}
