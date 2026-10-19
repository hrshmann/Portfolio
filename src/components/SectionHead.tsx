type Props = { label: string; refNo: string; children: React.ReactNode; id?: string };

export default function SectionHead({ label, refNo, children, id }: Props) {
  return (
    <header className="sec-head">
      <div className="sec-label">
        <span className="cap ink">{label}</span>
        <span className="cap">{refNo}</span>
      </div>
      <h2 className="sec-title" id={id}>
        {children}
      </h2>
    </header>
  );
}
