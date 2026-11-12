/* Server-only PDF documents (@react-pdf/renderer). Built-in Helvetica only. */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CATEGORY_DEFINITIONS, type ScorecardCategory } from "@/lib/scoring/model";
import type { PlayerDossier } from "@/lib/passport/dossier";
import type { FullReport } from "@/lib/scouting/queries";
import type { PlayerRow } from "@/lib/players/queries";
import type { AnalyticsData, Bar } from "@/lib/analytics/queries";
import type { AcademySummary } from "@/lib/analytics/academy";

const C = {
  band: "#0A1D30",
  navy: "#102A43",
  ink: "#1F2937",
  muted: "#6B7280",
  line: "#E5E7EB",
  lime: "#4D7C0F",
  amber: "#B45309",
  soft: "#F3F4F6",
};

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 54, paddingHorizontal: 40, fontSize: 10, color: C.ink, fontFamily: "Helvetica" },
  band: { backgroundColor: C.band, color: "#FFFFFF", padding: 16, borderRadius: 6, marginBottom: 16 },
  brand: { fontSize: 11, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 4 },
  bandSub: { fontSize: 9, color: "#AEB6B4", marginTop: 4 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.navy, marginBottom: 6, marginTop: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "33.33%", marginBottom: 8, paddingRight: 8 },
  cellWide: { width: "50%", marginBottom: 8, paddingRight: 8 },
  label: { fontSize: 7.5, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: C.ink, marginTop: 1 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 4 },
  th: { fontSize: 7.5, color: C.muted, textTransform: "uppercase", fontFamily: "Helvetica-Bold" },
  td: { fontSize: 9 },
  headRow: { flexDirection: "row", borderBottomWidth: 1.5, borderBottomColor: C.navy, paddingBottom: 4 },
  para: { fontSize: 10, lineHeight: 1.4, marginBottom: 6 },
  note: { fontSize: 8.5, color: C.muted, marginTop: 2 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 7.5, color: C.muted, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 6 },
  pill: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.navy },
});

function Field({ label, value, wide }: { label: string; value: string | null | undefined; wide?: boolean }) {
  return (
    <View style={wide ? s.cellWide : s.cell}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value && value !== "—" ? value : "—"}</Text>
    </View>
  );
}

function Footer({ text }: { text: string }) {
  return (
    <Text
      style={s.footer}
      render={({ pageNumber, totalPages }) => `${text}   ·   Page ${pageNumber} of ${totalPages}`}
      fixed
    />
  );
}

const DATE = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ------------------------------------------------------------------ dossier */

export function DossierDocument({ dossier }: { dossier: PlayerDossier }) {
  const p = dossier.player;
  const legal = [p.legal_first_name, p.legal_last_name].filter(Boolean).join(" ") || p.display_name;
  const assoc = dossier.academy?.association ?? "member association";
  const cols = ["Club", "Association", "Season", "From", "To", "Status", "Type", "State"];
  const widths = ["22%", "18%", "9%", "12%", "12%", "11%", "9%", "7%"];
  return (
    <Document title={`Registration dossier — ${legal}`}>
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <Text style={s.brand}>TALENT BRIDGE AFRICA</Text>
          <Text style={s.title}>Player Registration Dossier</Text>
          <Text style={s.bandSub}>Prepared for submission to {assoc} · generated {DATE(dossier.generatedAt)}</Text>
        </View>

        <Text style={s.sectionTitle}>Player identity</Text>
        <View style={s.grid}>
          <Field label="Legal name" value={legal} wide />
          <Field label="Preferred name" value={p.preferred_name} wide />
          <Field label="Date of birth" value={DATE(p.date_of_birth)} />
          <Field label="Gender" value={p.gender} />
          <Field label="Nationality" value={p.nationality} />
          <Field label="Place of birth" value={p.place_of_birth} />
          <Field label="Country of birth" value={p.country_of_birth} />
          <Field label="FIFA Connect ID" value={p.fifa_connect_id} />
          <Field label="Primary position" value={p.primary_position} />
          <Field label="Dominant foot" value={p.dominant_foot} />
          <Field label="Height" value={p.height_cm ? `${p.height_cm} cm` : null} />
          <Field label="Minor" value={p.is_minor ? "Yes" : "No"} />
        </View>

        <Text style={s.sectionTitle}>Academy / club</Text>
        <View style={s.grid}>
          <Field label="Club / academy" value={dossier.academy?.name} wide />
          <Field label="Club FIFA Connect ID" value={dossier.academy?.fifaConnectId} wide />
          <Field label="Member association" value={dossier.academy?.association} wide />
          <Field label="Association FIFA ID" value={dossier.academy?.associationFifaId} wide />
        </View>

        <Text style={s.sectionTitle}>Registration history</Text>
        <View style={s.headRow}>
          {cols.map((c, i) => (
            <Text key={c} style={[s.th, { width: widths[i] }]}>{c}</Text>
          ))}
        </View>
        {dossier.registrations.length === 0 ? (
          <Text style={[s.note, { marginTop: 6 }]}>No registration history recorded yet.</Text>
        ) : (
          dossier.registrations.map((r) => (
            <View key={r.id} style={s.row}>
              <Text style={[s.td, { width: widths[0] }]}>{r.club ?? "—"}</Text>
              <Text style={[s.td, { width: widths[1] }]}>{r.association ?? "—"}</Text>
              <Text style={[s.td, { width: widths[2] }]}>{r.season_year ?? "—"}</Text>
              <Text style={[s.td, { width: widths[3] }]}>{DATE(r.registered_from)}</Text>
              <Text style={[s.td, { width: widths[4] }]}>{r.registered_to ? DATE(r.registered_to) : "current"}</Text>
              <Text style={[s.td, { width: widths[5] }]}>{r.player_status}</Text>
              <Text style={[s.td, { width: widths[6] }]}>{r.registration_kind}</Text>
              <Text style={[s.td, { width: widths[7] }]}>{r.state}</Text>
            </View>
          ))
        )}

        <Text style={s.sectionTitle}>Verification</Text>
        {dossier.verifications.length === 0 ? (
          <Text style={s.note}>No verification records.</Text>
        ) : (
          dossier.verifications.map((v, i) => (
            <View key={i} style={s.row}>
              <Text style={[s.td, { width: "50%" }]}>{v.type}</Text>
              <Text style={[s.td, { width: "30%" }]}>{v.status}</Text>
              <Text style={[s.td, { width: "20%" }]}>{v.expires_at ? `exp ${DATE(v.expires_at)}` : "—"}</Text>
            </View>
          ))
        )}

        <Footer text="Talent Bridge Africa — not an official FIFA document. Prepared to support registration via the member association (FIFA RSTP)." />
      </Page>
    </Document>
  );
}

/* ------------------------------------------------------------------- report */

const REC_LABEL: Record<string, string> = {
  monitor: "Monitor",
  reassess: "Reassess",
  development_priority: "Development priority",
  technical_review: "Technical review",
};

export function ReportDocument({ report }: { report: FullReport }) {
  return (
    <Document title={`Scouting report — ${report.player_name ?? "Player"}`}>
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <Text style={s.brand}>TALENT BRIDGE AFRICA</Text>
          <Text style={s.title}>Scouting Match Report</Text>
          <Text style={s.bandSub}>
            {report.player_name ?? "Player"} · {report.match?.competition ?? "—"}
            {report.match?.away_team ? ` vs ${report.match.away_team}` : ""} · {DATE(report.match?.match_date)}
          </Text>
        </View>

        <View style={s.grid}>
          <Field label="Weighted index" value={report.weighted_score != null ? `${report.weighted_score} / 100` : null} />
          <Field label="Status" value={report.status.replace("_", " ")} />
          <Field label="Confidence" value={report.confidence} />
          <Field label="Position observed" value={report.position_observed} />
          <Field label="Minutes" value={report.minutes_observed != null ? String(report.minutes_observed) : null} />
          <Field label="Recommendation" value={(report.recommendation && REC_LABEL[report.recommendation]) || null} />
        </View>

        <Text style={s.sectionTitle}>Scorecard (seven weighted categories)</Text>
        <View style={s.headRow}>
          <Text style={[s.th, { width: "55%" }]}>Category</Text>
          <Text style={[s.th, { width: "25%" }]}>Rating</Text>
          <Text style={[s.th, { width: "20%" }]}>Weight</Text>
        </View>
        {report.ratings.map((r) => (
          <View key={r.category} style={s.row}>
            <Text style={[s.td, { width: "55%" }]}>
              {CATEGORY_DEFINITIONS[r.category as ScorecardCategory]?.label.split(" — ")[0] ?? r.category}
            </Text>
            <Text style={[s.td, { width: "25%" }]}>{r.rating_1_to_10}/10</Text>
            <Text style={[s.td, { width: "20%" }]}>{Math.round(r.weight_snapshot * 100)}%</Text>
          </View>
        ))}

        {report.speed ? (
          <>
            <Text style={s.sectionTitle}>Speed sub-scores</Text>
            <Text style={s.para}>
              Acceleration {report.speed.acceleration ?? "–"} · Top speed {report.speed.top_speed ?? "–"} · Repeated sprint{" "}
              {report.speed.repeated_sprint ?? "–"} · Football speed {report.speed.football_speed ?? "–"}
            </Text>
          </>
        ) : null}

        {report.overlay.length > 0 ? (
          <>
            <Text style={s.sectionTitle}>Position-specific assessment</Text>
            {report.overlay.map((o, i) => (
              <View key={i} style={s.row}>
                <Text style={[s.td, { width: "70%" }]}>{o.attribute}</Text>
                <Text style={[s.td, { width: "30%" }]}>{o.rating_1_to_10 != null ? `${o.rating_1_to_10}/10` : "—"}</Text>
              </View>
            ))}
          </>
        ) : null}

        <Text style={s.sectionTitle}>Evidence</Text>
        <Text style={s.para}><Text style={{ fontFamily: "Helvetica-Bold" }}>Strengths: </Text>{report.strengths ?? "—"}</Text>
        <Text style={s.para}><Text style={{ fontFamily: "Helvetica-Bold" }}>Development: </Text>{report.development_areas ?? "—"}</Text>
        {report.narrative ? (
          <Text style={s.para}><Text style={{ fontFamily: "Helvetica-Bold" }}>Narrative: </Text>{report.narrative}</Text>
        ) : null}

        <Footer text="Talent Bridge Africa — a structured screening aid, not a FIFA rating or a guarantee. Read with age, level and context (§6)." />
      </Page>
    </Document>
  );
}

/* ------------------------------------------------------------------ profile */

export function ProfileDocument({ player, canSeeSensitive }: { player: PlayerRow; canSeeSensitive: boolean }) {
  return (
    <Document title={`Player profile — ${player.preferred_name || player.display_name}`}>
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <Text style={s.brand}>TALENT BRIDGE AFRICA</Text>
          <Text style={s.title}>{player.preferred_name || player.display_name}</Text>
          <Text style={s.bandSub}>
            {player.primary_position ?? "Unassigned"} · {player.dominant_foot ?? "—"} footed
            {player.academy_name ? ` · ${player.academy_name}` : ""}
          </Text>
        </View>
        <Text style={s.sectionTitle}>Overview</Text>
        <View style={s.grid}>
          <Field label="Primary position" value={player.primary_position} />
          <Field label="Dominant foot" value={player.dominant_foot} />
          <Field label="Height" value={player.height_cm ? `${player.height_cm} cm` : null} />
          <Field label="Location" value={player.location} />
          <Field label="Profile status" value={player.profile_status.replace("_", " ")} />
          <Field label="Completeness" value={`${player.completeness_percent}%`} />
          <Field label="Nationality" value={canSeeSensitive ? player.nationality : "Restricted"} />
          <Field label="Date of birth" value={canSeeSensitive ? DATE(player.date_of_birth) : "Restricted"} />
          <Field label="Secondary positions" value={(player.secondary_positions ?? []).join(", ") || null} />
        </View>
        <Footer text="Talent Bridge Africa — player profile summary. Private and consent-based; not an official registration document." />
      </Page>
    </Document>
  );
}

/* ---------------------------------------------------------------- analytics */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: "33.33%", marginBottom: 10, paddingRight: 8 }}>
      <Text style={s.label}>{label}</Text>
      <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: C.navy, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

function BarRows({ data }: { data: Bar[] }) {
  if (data.length === 0) return <Text style={s.note}>No data yet.</Text>;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View>
      {data.map((d) => (
        <View key={d.label} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
          <Text style={{ width: "34%", fontSize: 9, color: C.ink }}>{d.label}</Text>
          <View style={{ width: "54%", height: 8, backgroundColor: C.soft, borderRadius: 4 }}>
            <View style={{ width: `${Math.round((d.value / max) * 100)}%`, height: 8, backgroundColor: C.lime, borderRadius: 4 }} />
          </View>
          <Text style={{ width: "12%", fontSize: 9, textAlign: "right", fontFamily: "Helvetica-Bold", color: C.ink }}>
            {d.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function AnalyticsDocument({ data, preparedBy }: { data: AnalyticsData; preparedBy: string }) {
  return (
    <Document title="Talent Bridge Africa — operations summary">
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <Text style={s.brand}>TALENT BRIDGE AFRICA</Text>
          <Text style={s.title}>Operations Summary</Text>
          <Text style={s.bandSub}>Prepared by {preparedBy} · generated {DATE(new Date().toISOString())}</Text>
        </View>

        <Text style={s.sectionTitle}>Key figures</Text>
        <View style={s.grid}>
          <Stat label="Players" value={String(data.totals.players)} />
          <Stat label="Reports" value={`${data.totals.reports}  (${data.totals.approvedReports} approved)`} />
          <Stat label="Academies" value={String(data.totals.academies)} />
          <Stat label="Avg. profile completeness" value={`${data.avgCompleteness}%`} />
          <Stat label="Evidence-backed reports" value={`${data.evidenceRate}%`} />
          <Stat label="Training sessions" value={String(data.sessions)} />
        </View>

        <Text style={s.sectionTitle}>Position distribution</Text>
        <BarRows data={data.positionDistribution} />

        <Text style={s.sectionTitle}>Report pipeline (by status)</Text>
        <BarRows data={data.reportStatus} />

        <Text style={s.sectionTitle}>Recruiter enquiries (by status)</Text>
        <BarRows data={data.enquiryStatus} />

        <Footer text="Talent Bridge Africa — operations summary (§5 M12). Screening and operational metrics, not a FIFA rating." />
      </Page>
    </Document>
  );
}

/* --------------------------------------------------------------- academy */

export function AcademyDocument({ summary }: { summary: AcademySummary }) {
  const rw = ["46%", "22%", "12%", "12%", "8%"];
  return (
    <Document title={`Academy summary — ${summary.academyName}`}>
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <Text style={s.brand}>TALENT BRIDGE AFRICA</Text>
          <Text style={s.title}>Academy Summary</Text>
          <Text style={s.bandSub}>{summary.academyName} · generated {DATE(summary.generatedAt)}</Text>
        </View>

        <Text style={s.sectionTitle}>Key figures</Text>
        <View style={s.grid}>
          <Stat label="Players in squad" value={String(summary.kpis.squadSize)} />
          <Stat label="Sessions this week" value={String(summary.kpis.sessionsThisWeek)} />
          <Stat label="Reviews due (12-wk)" value={String(summary.kpis.reviewsDue)} />
          <Stat label="Avg. profile completeness" value={`${summary.avgCompleteness}%`} />
        </View>

        <Text style={s.sectionTitle}>Squad by position</Text>
        <BarRows data={summary.positionDistribution} />

        <Text style={s.sectionTitle}>Squad by profile status</Text>
        <BarRows data={summary.statusDistribution} />

        <Text style={s.sectionTitle}>Roster ({summary.totalPlayers})</Text>
        <View style={s.headRow}>
          <Text style={[s.th, { width: rw[0] }]}>Player</Text>
          <Text style={[s.th, { width: rw[1] }]}>Position</Text>
          <Text style={[s.th, { width: rw[2] }]}>Age</Text>
          <Text style={[s.th, { width: rw[3] }]}>Status</Text>
          <Text style={[s.th, { width: rw[4], textAlign: "right" }]}>%</Text>
        </View>
        {summary.roster.length === 0 ? (
          <Text style={[s.note, { marginTop: 6 }]}>No players in the squad yet.</Text>
        ) : (
          summary.roster.map((r, i) => (
            <View key={i} style={s.row} wrap={false}>
              <Text style={[s.td, { width: rw[0] }]}>{r.name}</Text>
              <Text style={[s.td, { width: rw[1] }]}>{r.position}</Text>
              <Text style={[s.td, { width: rw[2] }]}>{r.ageBand}</Text>
              <Text style={[s.td, { width: rw[3] }]}>{r.status}</Text>
              <Text style={[s.td, { width: rw[4], textAlign: "right" }]}>{r.completeness}</Text>
            </View>
          ))
        )}

        <Footer text="Talent Bridge Africa — academy summary. Operational overview, consent-based; not an official registration document." />
      </Page>
    </Document>
  );
}
