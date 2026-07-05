import PageFrame from "@/components/PageFrame";

const timeline = [
  ["Code", "用工程方法整理想法，让小工具逐步成为稳定作品。"],
  ["Research", "关注 AI、交互、知识系统与可持续维护的个人基础设施。"],
  ["Music", "把情绪说唱、采样和夜间写作放进同一条时间线。"],
];

export default function About() {
  return (
    <PageFrame eyebrow="About" title="一个在冷雾中点亮暖光的人">
      <section className="about-text">
        <p>StarsailsClover 的个人空间以代码为骨架，以音乐和写作为水汽。这里展示的不是传统履历表，而是长期创作留下的路径。</p>
      </section>
      <div className="timeline">
        {timeline.map(([label, text]) => (
          <div className="timeline-item" key={label}>
            <span>{label}</span>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}
