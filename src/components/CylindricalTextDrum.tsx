import React from "react";

interface CylindricalTextDrumProps {
  scrollProgress: number; // 0 to 3.5
}

const LINES = [
  "تخليداً لذكرى العالم الفذ [عبد الجبار عبد الله]،",
  "المولود عام [1911] بمحافظة ميسان، العراق،",
  "من طائفة [الصابئة المندائيين] العريقة والمسالمة.",
  "",
  "عقل متقد وعشق للـ[فيزياء] منذ صغره،",
  "تخرّج من [الجامعة الأمريكية في بيروت] عام [1934]،",
  "فاتحاً [آفاقاً علمية] جديدة للوطن العربي.",
  "",
  "وفي عام [1946]، نال [دكتوراه من معهد MIT] المرموق،",
  "ليصبح باحثاً فذاً في [ديناميكية الغلاف الجوي]،",
  "وحاز على ثناء [ألبرت أينشتاين] شخصياً في برنستون.",
  "",
  "فك أسرار فيزياء [العواصف والأعاصير] المدمرة،",
  "مطوّراً نماذج رياضية لحساب [انتشار الموجات]،",
  "أرست الأسس الأولى لمجال [التنبؤ الجوي الحديث].",
  "",
  "وعند عودته لوطنه، أسس [قسم الفيزياء] بالعراق،",
  "بكلية [دار المعلمين العالية] العتيدة في بغداد،",
  "ملهماً أجيالاً لدراسة [العلوم الطبيعية].",
  "",
  "عُيّن ثاني رئيس لـ[جامعة بغداد] عام [1959]،",
  "تزعم راية الاستقلال والـ[تعاون الدولي]،",
  "محلقاً بـ[معايير التعليم العالي] للعالمية.",
  "",
  "لكن رياح السياسة غدرت: بعد [انقلاب 1963]،",
  "تعرّض العالم الكبير للاعتقال والـ[سجن]،",
  "بتهم باطلة خلّفتها [الاضطرابات السياسية].",
  "",
  "هبّت لمساندته ريح تضامن قادها [زملاء أينشتاين]،",
  "أثمرت بالضغط ونيل [الحرية الفورية] له،",
  "ليغادر مكرهاً ويواصل أبحاثه بأمريكا.",
  "",
  "انضم لـ[المركز الوطني لأبحاث الغلاف الجوي] (NCAR)،",
  "ثم بروفيسوراً بـ[جامعة نيويورك بألباني]،",
  "مقدماً أبحاثاً بـ[موجات الجاذبية] والضغط والأنواء.",
  "",
  "ترجل العالم الفذ عن صهوة الحياة في [9 يوليو 1969]،",
  "بيد أن [إرثه العلمي] والـ[مبادئ] والـ[رؤية] الخالدة،",
  "ستظل نبراساً ينير دروب المعرفة للبشرية."
];

const clamp01 = (val: number) => Math.max(0, Math.min(1, val));

interface Segment {
  text: string;
  highlight: boolean;
}

function parseSegments(line: string): Segment[] {
  const parts: Segment[] = [];
  let current = "";
  let insideBrackets = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === "[") {
      if (current) {
        parts.push({ text: current, highlight: false });
        current = "";
      }
      insideBrackets = true;
    } else if (char === "]") {
      if (current) {
        parts.push({ text: current, highlight: true });
        current = "";
      }
      insideBrackets = false;
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push({ text: current, highlight: insideBrackets });
  }

  return parts;
}

export default function CylindricalTextDrum({ scrollProgress }: CylindricalTextDrumProps) {
  const R = 380;
  const LINE_HEIGHT = 52;

  // Rotation is active after screen 2 reveals (scrollProgress 1.45 to 3.50)
  const drumStart = 1.45;
  const drumEnd = 3.50;
  const drumProgress = clamp01((scrollProgress - drumStart) / (drumEnd - drumStart));
  const targetIndex = drumProgress * (LINES.length - 1);

  return (
    <div
      dir="ltr"
      className="absolute inset-y-0 left-0 w-full sm:w-[65%] md:w-[60%] z-30 flex flex-col items-start justify-center pointer-events-none select-none px-6 sm:px-12 md:px-20 py-16"
      style={{
        perspective: "1000px",
        perspectiveOrigin: "25% 50%",
        maskImage: "linear-gradient(to bottom, transparent, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 80%, transparent)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 80%, transparent)",
      }}
    >
      <div
        className="relative w-full h-[85vh] flex flex-col justify-center items-start overflow-visible"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {LINES.map((line, idx) => {
          const indexDiff = idx - targetIndex;
          const translateY = indexDiff * LINE_HEIGHT;
          const angleRad = translateY / R;
          const angleDeg = angleRad * (180 / Math.PI);
          const translateZ = Math.cos(angleRad) * R - R;
          const baseScale = 0.78 + Math.cos(angleRad) * 0.22;
          const opacity = Math.max(0, (Math.cos(angleRad) - 0.2) / 0.8);
          const depthBlur = Math.min(8, Math.max(0, (Math.abs(indexDiff) - 1.5) * 0.75));

          const style: React.CSSProperties = {
            transform: `translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${-angleDeg * 0.8}deg) scale(${baseScale})`,
            transformOrigin: "right center",
            opacity: line === "" ? opacity * 0.3 : opacity,
            filter: depthBlur > 0.1 ? `blur(${depthBlur}px)` : "none",
            willChange: "transform, opacity, filter",
            position: "absolute",
            left: 0,
            width: "100%",
          };

          if (line === "") {
            return (
              <div
                key={idx}
                style={style}
                className="h-[52px] w-full flex items-center justify-start"
              />
            );
          }

          const segments = parseSegments(line);

          return (
            <p
              key={idx}
              dir="rtl"
              style={style}
              className="font-manrope text-[11px] sm:text-[15px] md:text-[19px] lg:text-[23px] font-bold leading-normal tracking-normal whitespace-nowrap select-none text-right"
            >
              {segments.map((seg, sIdx) => {
                if (seg.highlight) {
                  const magentaKeywords = [
                    "عبد الجبار عبد الله", "1911", "الصابئة المندائيين", "فيزياء", 
                    "الجامعة الأمريكية في بيروت", "1934", "آفاقاً علمية", "1946", 
                    "دكتوراه من معهد mit", "ديناميكية الغلاف الجوي", "ألبرت أينشتاين", 
                    "العواصف والأعاصير", "انتشار الموجات", "التنبؤ الجوي الحديث", 
                    "قسم الفيزياء", "دار المعلمين العالية", "العلوم الطبيعية", 
                    "جامعة بغداد", "1959", "تعاون الدولي", "معايير التعليم العالي", 
                    "انقلاب 1963", "سجن", "الاضطرابات السياسية", "زملاء أينشتاين", 
                    "الحرية الفورية", "المركز الوطني لأبحاث الغلاف الجوي", 
                    "جامعة نيويورك بألباني", "موجات الجاذبية", "9 يوليو 1969", 
                    "إرثه العلمي", "مبادئ", "رؤية"
                  ];
                  const hasMagentaKeyword = magentaKeywords.some(keyword => 
                    seg.text.toLowerCase().includes(keyword)
                  );
                  
                  return (
                    <span
                      key={sIdx}
                      className={
                        hasMagentaKeyword
                          ? "text-[#FF005E] font-bold opacity-100 drop-shadow-[0_0_12px_rgba(255,0,94,0.6)]"
                          : "text-white font-bold opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      }
                    >
                      {seg.text}
                    </span>
                  );
                }
                return (
                  <span key={sIdx} className="text-white/60 font-semibold font-manrope">
                    {seg.text}
                  </span>
                );
              })}
            </p>
          );
        })}
      </div>
    </div>
  );
}
