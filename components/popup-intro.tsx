"use client";

import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Gift, X, Sparkles, Star} from "lucide-react";
import {useTranslations} from "next-intl";
import {colorMap} from "@/lib/colors";
import type {Product} from "@/lib/types";

// 首页弹框动画：礼物盒飞入 → 爆炸冲击波 → 便签消息卡片弹出。
// Homepage popup intro: gift flies in → burst shockwave → sticky-note message card pops up.
interface PopupIntroProps {
  product: Product;
  locale: "zh" | "en";
  onClose: () => void;
}

// 华丽粒子配色（宝石 + 金属色系）/ Fancy particle colors (gem + metallic palette).
const PARTICLE_COLORS = [
  "#FFD700", // gold 金
  "#FF6B9D", // rose 玫瑰
  "#7DD3FC", // sapphire 蓝宝
  "#5EEAD4", // emerald 翡翠
  "#C4B5FD", // amethyst 紫水晶
  "#FDBA74", // coral 珊瑚
  "#F0ABFC", // magenta 品红
  "#FDE047", // yellow 黄
  "#67E8F9", // cyan 青
  "#FDA4AF", // pink 粉
  "#86EFAC", // green 绿
  "#FCA5A5", // red 红
];

// 粒子形状 / Particle shape.
type ParticleShape = "circle" | "star" | "diamond";

interface Particle {
  angle: number;      // 飞行角度（弧度）
  distance: number;
  size: number;       // 尺寸 px
  shape: ParticleShape;
  color: string;
  rotation: number;   // 总旋转角度
  rotationDir: 1 | -1;
}

// 生成 18 个主粒子（模块顶层生成一次，保证渲染稳定）/ 18 main particles (generated once at module level).
const MAIN_PARTICLES: Particle[] = Array.from({length: 18}, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 2 === 0 ? 0.12 : -0.08);
  const shapes: ParticleShape[] = ["circle", "star", "diamond", "circle", "star"];
  return {
    angle,
    distance: 130 + (i % 3) * 35 + (i % 2) * 20,
    size: 9 + (i % 4) * 3,
    shape: shapes[i % shapes.length],
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    rotation: 180 + (i % 5) * 60,
    rotationDir: i % 2 === 0 ? 1 : -1,
  };
});

// 生成 12 个二次小粒子（飞得更远、更小，延迟出现）/ 12 secondary small particles (farther, smaller, delayed).
const SECONDARY_PARTICLES: Particle[] = Array.from({length: 12}, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 + 0.2;
  return {
    angle,
    distance: 170 + (i % 3) * 40,
    size: 5 + (i % 3) * 2,
    shape: i % 3 === 0 ? "star" : "circle",
    color: PARTICLE_COLORS[(i + 3) % PARTICLE_COLORS.length],
    rotation: 240,
    rotationDir: i % 2 === 0 ? -1 : 1,
  };
});

// 动画时序常量 / Animation timing constants.
const TIMING = {
  giftTotal: 3.0,
  giftFlyEnd: 0.667,
  giftHoldEnd: 0.767,
  burstDelay: 2.3,
  shockwaveDuration: 1.2,
  shockwave2Delay: 2.45,
  shockwave2Duration: 1.1,
  particleDuration: 1.6,
  secondaryParticleDelay: 2.55, // 二次粒子稍晚出现
  secondaryParticleDuration: 1.4,
  cardDelay: 4000,
};

// 渲染单个粒子形状 / Render a single particle shape.
function ParticleShapeView({particle}: {particle: Particle}) {
  const {size, shape, color} = particle;
  const glow = `0 0 ${size * 0.6}px ${color}, 0 0 ${size * 1.2}px ${color}66`;

  if (shape === "star") {
    return (
      <Star
        style={{width: size, height: size, color, filter: `drop-shadow(0 0 ${size * 0.4}px ${color})`}}
        fill={color}
        strokeWidth={1}
      />
    );
  }
  if (shape === "diamond") {
    return (
      <div
        className="rotate-45"
        style={{width: size * 0.75, height: size * 0.75, backgroundColor: color, boxShadow: glow}}
      />
    );
  }
  return (
    <div
      className="rounded-full"
      style={{width: size, height: size, backgroundColor: color, boxShadow: glow}}
    />
  );
}

export default function PopupIntro({product, locale, onClose}: PopupIntroProps) {
  const [cardVisible, setCardVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const name = product.name[locale];
  const desc = product.desc[locale];
  const category = product.category[locale];
  const t = useTranslations("popup");
  const tModal = useTranslations("modal");

  useEffect(() => {
    const timer = setTimeout(() => setCardVisible(true), TIMING.cardDelay);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 350);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{opacity: 0}}
      animate={{opacity: closing ? 0 : 1}}
      transition={{duration: 0.3}}
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />

      <div
        className="relative flex items-center justify-center w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 阶段 1+2：华丽礼物盒飞入 + 爆炸 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">

          {/* 礼物盒拖尾残影（3 层，延迟跟随） */}
          {[0, 1, 2].map((trailIdx) => (
            <motion.div
              key={`trail-${trailIdx}`}
              className="absolute"
              initial={{x: 220, y: -200, opacity: 0, scale: 0.3, rotate: -45}}
              animate={{
                x: [220, 0, 0],
                y: [-200, 0, 0],
                opacity: [0, 0.25 - trailIdx * 0.07, 0.25 - trailIdx * 0.07, 0],
                scale: [0.3, 1, 1.2, 2.2],
                rotate: [-45, 10, 0, 90],
              }}
              transition={{
                duration: TIMING.giftTotal,
                times: [0, TIMING.giftFlyEnd, TIMING.giftHoldEnd, 1],
                ease: "easeOut",
                delay: trailIdx * 0.07,
              }}
            >
              <Gift
                className="w-20 h-20 md:w-24 md:h-24 text-rose-400"
                strokeWidth={1.5}
                style={{filter: "blur(1px)"}}
              />
            </motion.div>
          ))}

          {/* 主礼物盒（光晕 + 环绕闪光 + 本体） */}
          <motion.div
            initial={{x: 220, y: -200, opacity: 0, scale: 0.3, rotate: -45}}
            animate={{
              x: [220, 0, 0],
              y: [-200, 0, 0],
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1, 1.2, 2.2],
              rotate: [-45, 10, 0, 90],
            }}
            transition={{
              duration: TIMING.giftTotal,
              times: [0, TIMING.giftFlyEnd, TIMING.giftHoldEnd, 1],
              ease: "easeOut",
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* 外层呼吸光晕 */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 110,
                  height: 110,
                  background: "radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(244,114,182,0.25) 45%, transparent 70%)",
                }}
                animate={{scale: [1, 1.35, 1], opacity: [0.6, 0.9, 0.6]}}
                transition={{duration: 0.9, repeat: Infinity, ease: "easeInOut"}}
              />

              {/* 环绕闪光（4 颗，整体旋转） */}
              <motion.div
                className="absolute"
                style={{width: 90, height: 90}}
                animate={{rotate: 360}}
                transition={{duration: 2.2, repeat: Infinity, ease: "linear"}}
              >
                {[0, 90, 180, 270].map((deg) => (
                  <div
                    key={deg}
                    className="absolute top-1/2 left-1/2"
                    style={{transform: `rotate(${deg}deg) translateY(-38px) translateX(-50%)`}}
                  >
                    <motion.div
                      animate={{scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7]}}
                      transition={{duration: 0.6, repeat: Infinity, delay: deg / 360 * 0.6}}
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </motion.div>
                  </div>
                ))}
              </motion.div>

              {/* 礼物盒本体 */}
              <div className="relative">
                <Gift
                  className="w-20 h-20 md:w-24 md:h-24 text-rose-500"
                  strokeWidth={1.5}
                  style={{filter: "drop-shadow(0 4px 12px rgba(244,63,94,0.45))"}}
                />
                {/* 顶部大闪光 */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{scale: [1, 1.4, 1], rotate: [0, 25, 0]}}
                  transition={{duration: 0.7, repeat: Infinity, repeatType: "reverse"}}
                >
                  <Sparkles className="w-7 h-7 text-amber-400" style={{filter: "drop-shadow(0 0 6px rgba(251,191,36,0.8))"}} />
                </motion.div>
                {/* 左下小闪光 */}
                <motion.div
                  className="absolute -bottom-1 -left-2"
                  animate={{scale: [0.8, 1.2, 0.8], rotate: [0, -20, 0]}}
                  transition={{duration: 0.8, repeat: Infinity, repeatType: "reverse", delay: 0.3}}
                >
                  <Sparkles className="w-5 h-5 text-pink-300" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* 爆炸中心星芒（4 条光线） */}
          <motion.div
            className="absolute"
            initial={{opacity: 0, scale: 0, rotate: 0}}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 2, 3],
              rotate: [0, 45],
            }}
            transition={{duration: 1.1, delay: TIMING.burstDelay, ease: "easeOut"}}
          >
            <div className="absolute w-1.5 h-28 bg-gradient-to-b from-amber-200 via-amber-400 to-transparent left-1/2 -translate-x-1/2 -top-14 rounded-full" />
            <div className="absolute w-1.5 h-28 bg-gradient-to-t from-amber-200 via-amber-400 to-transparent left-1/2 -translate-x-1/2 top-14 rounded-full" />
            <div className="absolute h-1.5 w-28 bg-gradient-to-r from-amber-200 via-amber-400 to-transparent top-1/2 -translate-y-1/2 -left-14 rounded-full" />
            <div className="absolute h-1.5 w-28 bg-gradient-to-l from-amber-200 via-amber-400 to-transparent top-1/2 -translate-y-1/2 left-14 rounded-full" />
          </motion.div>

          {/* 爆炸冲击波圆环 */}
          <motion.div
            className="absolute w-24 h-24 rounded-full border-4 border-amber-400"
            initial={{scale: 0, opacity: 0.9}}
            animate={{scale: 3.8, opacity: 0}}
            transition={{duration: TIMING.shockwaveDuration, delay: TIMING.burstDelay, ease: "easeOut"}}
            style={{boxShadow: "0 0 20px rgba(251,191,36,0.6), inset 0 0 20px rgba(251,191,36,0.3)"}}
          />
          <motion.div
            className="absolute w-24 h-24 rounded-full border-2 border-rose-400"
            initial={{scale: 0, opacity: 0.8}}
            animate={{scale: 3, opacity: 0}}
            transition={{duration: TIMING.shockwave2Duration, delay: TIMING.shockwave2Delay, ease: "easeOut"}}
            style={{boxShadow: "0 0 15px rgba(251,113,133,0.5)"}}
          />
          {/* 第三层淡色冲击波 */}
          <motion.div
            className="absolute w-24 h-24 rounded-full border border-purple-300"
            initial={{scale: 0, opacity: 0.6}}
            animate={{scale: 4.2, opacity: 0}}
            transition={{duration: 1.4, delay: 2.6, ease: "easeOut"}}
          />

          {/* 主粒子（18 个，圆/星/菱混合，带发光和旋转） */}
          {MAIN_PARTICLES.map((p, i) => (
            <motion.div
              key={`main-${i}`}
              className="absolute flex items-center justify-center"
              initial={{x: 0, y: 0, opacity: 0, scale: 0, rotate: 0}}
              animate={{
                x: Math.cos(p.angle) * p.distance,
                y: Math.sin(p.angle) * p.distance,
                opacity: [0, 1, 1, 0],
                scale: [0, 1.3, 1, 0.2],
                rotate: [0, p.rotation * p.rotationDir],
              }}
              transition={{duration: TIMING.particleDuration, delay: TIMING.burstDelay, ease: "easeOut"}}
            >
              <ParticleShapeView particle={p} />
            </motion.div>
          ))}

          {/* 二次小粒子（12 个，更远更碎，稍晚出现） */}
          {SECONDARY_PARTICLES.map((p, i) => (
            <motion.div
              key={`sec-${i}`}
              className="absolute flex items-center justify-center"
              initial={{x: 0, y: 0, opacity: 0, scale: 0, rotate: 0}}
              animate={{
                x: Math.cos(p.angle) * p.distance,
                y: Math.sin(p.angle) * p.distance,
                opacity: [0, 0.9, 0.9, 0],
                scale: [0, 1, 0.8, 0.1],
                rotate: [0, p.rotation * p.rotationDir],
              }}
              transition={{duration: TIMING.secondaryParticleDuration, delay: TIMING.secondaryParticleDelay, ease: "easeOut"}}
            >
              <ParticleShapeView particle={p} />
            </motion.div>
          ))}
        </div>

        {/* 阶段 3：便签消息卡片 */}
        <AnimatePresence>
          {cardVisible && (
            <motion.div
              initial={{opacity: 0, scale: 0.5, y: 30, rotate: -8}}
              animate={{
                opacity: closing ? 0 : 1,
                scale: closing ? 0.8 : 1,
                y: closing ? 20 : 0,
                rotate: closing ? -4 : -2,
              }}
              transition={{type: "spring", stiffness: 300, damping: 20}}
              className={`relative w-full ${colorMap[product.color]} border-2 border-black/15 shadow-sticky rounded-lg`}
            >
              <div className="tape" />

              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-paper/80 border-2 border-ink/20 hover:bg-paper hover:scale-110 transition-all"
                aria-label={tModal("close")}
              >
                <X className="w-4 h-4 text-ink" />
              </button>

              <div className="p-6 md:p-8 pt-9">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 font-caveat text-xs md:text-sm font-semibold px-3 py-1 border-2 border-ink rounded-full bg-paper/70 -rotate-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {category}
                  </span>
                </div>

                <h2 className="font-hand text-2xl md:text-3xl leading-tight mb-3 text-ink">
                  {name}
                </h2>

                <p className="font-script text-base md:text-lg leading-relaxed text-ink-light whitespace-pre-line">
                  {desc}
                </p>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="font-caveat text-sm md:text-base font-semibold px-5 py-2 rounded-full bg-ink text-paper hover:bg-ink/80 hover:scale-105 transition-all shadow-md"
                  >
                    {t("gotIt")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
