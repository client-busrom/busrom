import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import Link from "next/link";

const vw = (px: number) => `${(px / 1920) * 100}vw`;

interface ApplicationMoreCasesSectionProps {
  locale: string;
  data: {
    title: { text: string; bold?: boolean }[];
    tips?: string;
    ctaText?: string;
    ctaHref?: string;
    applications?: any[];
  };
}

interface SeriesData {
  id: string;
  name: string;
  images: any[];
}

export function ApplicationMoreCasesSection({
  locale,
  data,
}: ApplicationMoreCasesSectionProps) {
  const [seriesList, setSeriesList] = useState<SeriesData[]>(() => {
    // Initialize from props if available
    if (data.applications && data.applications.length > 0) {
      return data.applications.map((app) => ({
        id: String(app.id),
        name: app.title || "",
        images: Array.isArray(app.image) ? app.image : [app.image],
      }));
    }
    return [];
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const lastClickTime = React.useRef(0);

  useEffect(() => {
    // Only fetch if we don't have data from props
    if (data.applications && data.applications.length > 0) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/more-cases?locale=${locale}`);
        const json = await res.json();
        if (json.series && json.series.length > 0) {
          setSeriesList(json.series);
        }
      } catch (e) {
        console.error("Failed to fetch more cases data", e);
      }
    };
    fetchData();
  }, [locale, data.applications]);

  const handleNext = () => {
    if (seriesList.length === 0) return;
    const now = Date.now();
    if (now - lastClickTime.current < 200) return;
    lastClickTime.current = now;
    setActiveIndex((prev) => (prev + 1) % seriesList.length);
  };

  const currentSeries = seriesList[activeIndex] || null;

  const S = 922 / 1190; // Height scale factor

  return (
    <>
      {/* Desktop view */}
      <section
        className="hidden lg:flex relative w-full overflow-hidden bg-[#FFFDF8] flex-col items-center select-none"
        style={{ height: vw(922) }}
      >
        <div className="relative w-full h-full">
          {/* Slot 0: Main Large Image */}
          <AnimatePresence mode="wait">
            {currentSeries && (
              <motion.div
                key={currentSeries.id + "-main"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute left-0 top-0 overflow-hidden"
                style={{
                  width: vw(959 * S),
                  height: vw(922),
                  zIndex: 10,
                  borderTopRightRadius: vw(60),
                  borderBottomRightRadius: vw(60),
                }}
              >
                <OptimizedImage
                  image={currentSeries.images[0]}
                  className="w-full h-full object-cover"
                  alt={currentSeries.name || "Main Case"}
                  size="large"
                  loading="eager"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Small Images - ZIndex 15 (Below decorative and title) */}
          {currentSeries && (
            <div className="absolute inset-0 z-[15] pointer-events-none">
              {/* Slot 1: Rectangle 436 */}
              <div
                className="absolute pointer-events-auto"
                style={{
                  left: vw(1452),
                  top: vw(205 * S),
                  width: vw(237 * S),
                  height: vw(327 * S),
                  zIndex: 15,
                }}
              >
                <ImageBox
                  src={currentSeries.images[1]}
                  id={currentSeries.id + "1"}
                />
              </div>

              {/* Slot 2: Rectangle 437 */}
              <div
                className="absolute pointer-events-auto"
                style={{
                  left: vw(1106),
                  top: vw(406 * S),
                  width: vw(481 * S),
                  height: vw(519 * S),
                  zIndex: 16,
                }}
              >
                <ImageBox
                  src={currentSeries.images[2]}
                  id={currentSeries.id + "2"}
                />
              </div>

              {/* Slot 3: Rectangle 439 */}
              <div
                className="absolute pointer-events-auto"
                style={{
                  left: vw(1424),
                  top: vw(632 * S),
                  width: vw(304 * S),
                  height: vw(469 * S),
                  zIndex: 17,
                }}
              >
                <ImageBox
                  src={currentSeries.images[3]}
                  id={currentSeries.id + "3"}
                />
              </div>

              {/* Slot 4: Rectangle 438 */}
              <div
                className="absolute pointer-events-auto"
                style={{
                  left: vw(986),
                  top: vw(708 * S),
                  width: vw(241 * S),
                  height: vw(354 * S),
                  zIndex: 18,
                }}
              >
                <ImageBox
                  src={currentSeries.images[4]}
                  id={currentSeries.id + "4"}
                />
              </div>
            </div>
          )}

          {/* Decorative Assets - ZIndex 30 (Above images) */}
          <div className="absolute inset-0 pointer-events-none z-30">
            <img
              src="/assets/images/application/More.svg"
              className="absolute"
              style={{
                left: vw(280),
                top: vw(221),
                width: vw(411.8),
                height: vw(154.7),
                opacity: 1,
              }}
              alt=""
            />
            <div
              className="absolute"
              style={{
                left: vw(1101),
                top: vw(160),
                width: vw(574.9),
                height: vw(694.2),
                opacity: 1,
              }}
            >
              <svg
                viewBox="0 0 637 997"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "100%", height: "100%" }}
              >
                {[
                  "M396.416 903.61C404.273 901.345 410.511 902.219 415.13 906.231C419.723 910.151 423.323 916.633 425.929 925.677L436.079 960.895L444.575 958.446L445.207 960.639L402.864 972.843L402.232 970.65L410.728 968.202L402.237 938.739C399.551 929.421 397.192 922.779 395.158 918.814C393.125 914.848 390.692 913.274 387.86 914.09C384.663 915.012 383.229 919.135 383.56 926.461C383.864 933.695 385.2 941.423 387.57 949.645L394.916 975.133L363.946 984.059L363.315 981.867L371.811 979.418L363.319 949.956C360.634 940.637 358.274 933.996 356.241 930.03C354.207 926.065 351.775 924.49 348.943 925.306C345.745 926.228 344.312 930.352 344.642 937.677C344.946 944.911 346.283 952.64 348.653 960.862L355.998 986.35L322.151 996.105L321.519 993.912L330.015 991.464L313.112 932.813L303.382 935.617L302.75 933.425L310.972 931.055C320.93 928.185 329.816 924.684 337.629 920.553L341.499 933.982L342.184 933.785C343.167 923.805 348.272 917.485 357.499 914.826C366.817 912.14 374.424 914.846 380.319 922.942L380.417 922.766L381.102 922.568C382.085 912.588 387.189 906.269 396.416 903.61Z",
                  "M212.276 865.2C206.521 872.74 198.115 877.454 187.056 879.34C175.996 881.227 166.503 879.567 158.574 874.361C150.629 869.061 145.762 861.163 143.971 850.666C142.181 840.17 144.163 831.151 149.917 823.611C155.656 815.977 164.054 811.217 175.113 809.331C186.172 807.444 195.674 809.151 203.619 814.451C211.548 819.657 216.407 827.508 218.198 838.005C219.988 848.501 218.014 857.567 212.276 865.2ZM192.173 868.63C192.669 863.626 191.879 855.032 189.8 842.849C187.722 830.665 185.627 822.342 183.516 817.88C181.482 813.308 178.825 811.302 175.545 811.861C172.265 812.421 170.376 815.202 169.88 820.206C169.461 825.1 170.29 833.639 172.368 845.822C174.447 858.006 176.503 866.384 178.536 870.956C180.648 875.418 183.344 877.369 186.624 876.81C189.904 876.25 191.754 873.523 192.173 868.63Z",
                  "M48.0875 306.021L48.7849 306.169C50.9856 303.139 53.6521 300.887 56.7844 299.416C59.9366 297.851 63.4189 297.475 67.2315 298.287C71.137 299.119 74.1609 301.124 76.3032 304.301C78.5582 307.406 79.2996 310.772 78.5273 314.398C77.755 318.025 76.0421 320.82 73.3885 322.782C70.7349 324.744 67.7343 325.369 64.3867 324.656C61.0391 323.943 58.5038 322.383 56.7809 319.974C55.1509 317.586 54.6429 314.95 55.2568 312.068C55.8904 309.092 57.2422 306.853 59.312 305.349C61.4946 303.773 63.8878 303.262 66.4915 303.816C69.0952 304.37 70.9895 305.746 72.1743 307.942C72.6211 309.496 73.2165 310.351 73.9605 310.51C74.7974 310.688 75.3049 310.359 75.4831 309.522C75.602 308.964 75.4715 308.207 75.0918 307.251C73.4937 303.8 70.6489 301.639 66.5573 300.768C55.111 298.332 46.9652 308.552 42.0939 331.428L36.1831 359.185L46.6444 361.413L46.1692 363.644L1.25531 354.08L1.73055 351.848L10.3786 353.69L23.0913 293.991L13.1879 291.882L13.6632 289.65L22.0322 291.432C32.1681 293.591 41.6551 294.688 50.4934 294.723L48.0875 306.021Z",
                  "M618.127 432.755C616.833 431.791 614.66 431.051 611.606 430.536C608.633 429.913 605.076 429.903 600.937 430.507C596.798 431.11 593.501 432.552 591.047 434.831C588.579 437.017 587.565 439.615 588.004 442.625C588.43 445.542 590.171 447.93 593.229 449.79C596.273 451.556 599.854 453.051 603.971 454.276C608.076 455.407 612.207 456.726 616.366 458.233C620.606 459.633 624.316 461.686 627.497 464.392C630.678 467.099 632.557 470.428 633.133 474.379C634.012 480.4 631.607 485.651 625.919 490.132C620.325 494.599 611.366 497.731 599.042 499.528C593.491 500.338 587.702 500.173 581.675 499.035C578.608 498.425 575.976 497.176 573.779 495.287C571.662 493.289 570.363 490.644 569.883 487.352C569.403 484.059 570.073 481.079 571.894 478.411C573.701 475.649 576.298 474.022 579.685 473.528C583.072 473.034 585.944 473.624 588.302 475.297C590.646 476.877 592.038 479.172 592.477 482.183C592.916 485.193 592.379 487.77 590.866 489.912C589.433 491.946 587.447 493.149 584.906 493.519C582.46 493.876 580.213 493.291 578.165 491.764C577.949 491.604 577.788 491.483 577.68 491.403C577.558 491.228 577.444 491.101 577.336 491.021C577.228 490.94 577.12 490.86 577.013 490.779C576.609 490.646 576.266 490.6 575.984 490.641C575.231 490.751 574.916 491.229 575.04 492.076C575.163 492.923 576.02 493.855 577.609 494.872C579.293 495.875 581.904 496.648 585.442 497.188C588.979 497.729 592.865 497.691 597.099 497.074C601.426 496.442 604.992 495.202 607.797 493.351C610.682 491.393 611.926 489.05 611.528 486.322C611.116 483.499 609.375 481.111 606.303 479.157C603.218 477.109 599.556 475.385 595.317 473.986C591.157 472.479 586.944 470.932 582.677 469.344C578.411 467.756 574.693 465.656 571.526 463.044C568.345 460.337 566.494 457.196 565.972 453.621C565.108 447.694 567.123 442.404 572.017 437.751C577.005 433.084 585.332 429.9 596.997 428.199C605.653 426.936 612.357 427.448 617.11 429.733C621.849 431.924 624.562 435.372 625.248 440.076C625.756 443.557 625.106 446.678 623.299 449.44C621.478 452.107 618.874 453.688 615.487 454.182C612.195 454.662 609.369 454.065 607.011 452.392C604.653 450.718 603.262 448.423 602.836 445.506C602.397 442.496 602.887 439.926 604.306 437.798C605.725 435.669 607.705 434.42 610.245 434.049C612.879 433.665 614.864 434.096 616.198 435.343C617.614 436.481 618.603 437.01 619.168 436.927C620.015 436.804 620.376 436.319 620.253 435.472C620.129 434.625 619.421 433.72 618.127 432.755Z",
                  "M297.942 263.355L306.644 261.786L307.049 264.032L271.821 270.384L269.847 259.436L269.145 259.563C267.15 269.39 261.427 275.156 251.977 276.86C243.93 278.311 237.822 276.852 233.653 272.484C229.468 268.022 226.54 261.159 224.869 251.896L218.34 215.686L208.375 217.483L207.971 215.237L216.391 213.719C226.216 211.948 235.225 209.405 243.419 206.092L249.771 241.32C251.475 250.77 253.127 257.524 254.729 261.583C256.313 265.548 258.556 267.269 261.456 266.746C264.731 266.155 266.637 262.527 267.174 255.861C267.694 249.101 267.212 241.604 265.727 233.371L261.172 208.108L251.207 209.905L250.777 207.519L259.198 206.001C269.022 204.229 278.031 201.687 286.225 198.374L297.942 263.355Z",
                  "M389.406 9.64873C401.459 13.0529 409.994 16.9006 415.01 21.1917C420.026 25.4828 421.73 30.4753 420.122 36.1692C418.764 40.9758 415.651 44.6478 410.783 47.1852C406.009 49.6695 399.176 50.255 390.285 48.9416L390.097 49.6071C397.376 51.8226 403.345 55.145 408.002 59.5744C410.468 61.8679 412.149 64.5384 413.045 67.586C414.015 70.6545 414.03 73.8526 413.09 77.1802C408.872 92.1175 394.783 96.2029 370.824 89.4362L333 78.7537L333.501 76.979L341.709 79.2972L355.431 30.7139C357.894 35.5616 362.453 38.9253 369.109 40.8049C375.838 42.7054 381.839 42.8033 387.111 41.0985C392.383 39.3937 395.854 35.5834 397.525 29.6676C398.737 25.3787 398.356 21.6382 396.383 18.446C394.484 15.2748 390.724 12.8956 385.104 11.3084C379.558 9.74201 374.649 9.31364 370.377 10.0233C366.178 10.7537 363.217 12.4726 361.495 15.1799C361.18 15.7297 360.991 16.1155 360.928 16.3374C360.74 17.0029 360.942 17.4192 361.534 17.5863C362.199 17.7742 362.826 17.3924 363.414 16.4406C364.097 15.4359 365.261 14.5668 366.905 13.8335C368.549 13.1003 370.74 13.12 373.476 13.8927C376.212 14.6654 378.169 16.2163 379.348 18.5454C380.6 20.8953 380.798 23.5861 379.942 26.618C379.107 29.5759 377.335 31.7503 374.627 33.1412C371.992 34.553 369.048 34.7994 365.794 33.8805C362.541 32.9616 360.102 30.9952 358.478 27.9815C356.854 24.9678 356.522 21.7601 357.483 18.3585C359.07 12.7386 362.717 9.29716 368.423 8.03434C374.203 6.7924 381.198 7.33053 389.406 9.64873ZM367.665 86.6277C373.876 88.382 378.619 87.8451 381.893 85.017C385.262 82.1359 387.896 77.3307 389.797 70.6015C391.718 63.7984 391.513 58.5902 389.179 54.977C386.846 51.3638 383.129 48.8367 378.026 47.3957L375.364 46.6438L364.337 85.6879L367.665 86.6277Z",
                ].map((pathD, idx) => (
                  <motion.path
                    key={idx}
                    d={pathD}
                    fill="#D0CB9B"
                    animate={{
                      y: [0, -20, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.4,
                    }}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Floating Tips Text */}
          {data.tips && (
            <div
              className="absolute font-berkshire-swash text-[#756F3F] opacity-70 pointer-events-none"
              style={{
                left: vw(978),
                top: vw(240),
                width: vw(182.3),
                height: vw(26.4),
                fontSize: vw(26),
                lineHeight: 1,
              }}
            >
              {data.tips}
            </div>
          )}

          {/* Split Title Layout - ZIndex 50 */}
          <div className="absolute inset-0 pointer-events-none z-50 text-shadow-sm">
            <h2
              className="absolute font-berkshire-swash text-[#FFFFFF] select-none text-right"
              style={{
                left: vw(20),
                top: vw(451),
                width: vw(669),
                fontSize: vw(128),
                lineHeight: 1.1,
                textShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            >
              {data.title?.[0]?.text?.split(" ")?.[0] || "Application"}
            </h2>

            <h2
              className="absolute font-berkshire-swash text-[#000000] select-none"
              style={{
                left: vw(973),
                top: vw(451),
                fontSize: vw(128),
                lineHeight: 1.1,
                textShadow: "0 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              {data.title?.[0]?.text?.split(" ")?.slice(1).join(" ") || "cases"}
            </h2>
          </div>

          {/* Navigation Section (Top Right) - Unified Interactive Group */}
          <div className="absolute z-60" style={{ right: vw(100), top: vw(39) }}>
            <Link
              href={data?.ctaHref || "#"}
              onClick={(e) => {
                const href = data?.ctaHref;
                if (!href || href === "#") {
                  e.preventDefault();
                  handleNext();
                }
              }}
            >
              <motion.div
                className="relative flex items-center group cursor-pointer no-underline"
                style={{ height: vw(66) }}
                initial="initial"
                whileHover="hover"
              >
                {/* Animated Capsule Background */}
                <motion.div
                  className="absolute right-0 bg-[#756F3F]"
                  variants={{
                    initial: {
                      width: vw(102.4),
                      height: "100%",
                      borderRadius: vw(39),
                    },
                    hover: {
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#5D5732",
                      borderRadius: vw(39),
                    },
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                <div
                  className="relative z-10 flex items-center"
                  style={{
                    gap: vw(60),
                    paddingLeft: vw(40),
                    paddingRight: vw(35),
                  }}
                >
                  <motion.span
                    className="font-anaheim font-semibold whitespace-nowrap"
                    style={{ fontSize: vw(28), lineHeight: vw(30) }}
                    variants={{
                      initial: { color: "#000000" },
                      hover: { color: "#FFFFFF" },
                    }}
                  >
                    {data?.ctaText || "view more"}
                  </motion.span>

                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="flex items-center justify-center active:scale-95"
                    style={{
                      width: vw(33),
                      height: vw(18),
                    }}
                  >
                    <svg
                      className="transition-transform group-hover:translate-x-1"
                      style={{ width: vw(33), height: vw(18) }}
                      viewBox="0 0 33 18"
                      fill="none"
                    >
                      <path
                        d="M1 9H31M31 9L23 1M31 9L23 17"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile and Tablet view */}
      <section className="lg:hidden w-full bg-[#FFFDF8] py-16 px-6 select-none flex flex-col items-center overflow-hidden">
        {/* Title */}
        <div className="w-full max-w-md flex flex-col items-center mb-6">
          <span
            className="text-xs uppercase tracking-widest text-[#756F3F]/60 font-semibold mb-2 font-quicksand"
          >
            {data.tips || "Gallery"}
          </span>
          <h2
            className="text-3xl font-extrabold uppercase text-[#756F3F] text-center font-berkshire-swash leading-tight"
          >
            {data.title?.[0]?.text || "Application Cases"}
          </h2>
        </div>

        {/* Content Wrapper */}
        <div className="w-full max-w-md flex flex-col gap-4">
          {/* Active Series Name */}
          {currentSeries && (
            <h3 className="text-lg font-bold text-black text-center font-anaheim tracking-wide">
              {currentSeries.name}
            </h3>
          )}

          {/* Main Image */}
          <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg bg-[#D6D3C2]">
            <AnimatePresence mode="wait">
              {currentSeries && (
                <motion.div
                  key={currentSeries.id + "-mobile-main"}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full"
                >
                  <OptimizedImage
                    image={currentSeries.images[0]}
                    className="w-full h-full object-cover"
                    alt={currentSeries.name || "Case main image"}
                    size="large"
                    loading="eager"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sub-images 2x2 Grid */}
          {currentSeries && currentSeries.images && currentSeries.images.length > 1 && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[1, 2, 3, 4].map((idx) => {
                const img = currentSeries.images[idx];
                if (!img) return null;
                return (
                  <div
                    key={idx}
                    className="aspect-square rounded-[1.25rem] overflow-hidden bg-[#F0F0F0] shadow-sm relative"
                  >
                    <OptimizedImage
                      image={img}
                      className="w-full h-full object-cover"
                      alt={`Case detail ${idx}`}
                      size="large"
                      loading="eager"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigation Controls & CTA */}
          <div className="flex flex-col items-center gap-6 mt-6">
            {/* Arrows & pagination indicator */}
            <div className="flex items-center gap-6">
              <button
                onClick={() =>
                  setActiveIndex((prev) => (prev - 1 + seriesList.length) % seriesList.length)
                }
                className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center bg-black/5 active:scale-95 transition-all text-[#756F3F]"
              >
                <svg viewBox="0 0 14 24" fill="none" className="w-3 h-5 rotate-180">
                  <path
                    d="M1 23L12 12L1 1"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <span className="text-sm font-bold text-black/50 font-anaheim">
                {activeIndex + 1} / {seriesList.length}
              </span>

              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center bg-black/5 active:scale-95 transition-all text-[#756F3F]"
              >
                <svg viewBox="0 0 14 24" fill="none" className="w-3 h-5">
                  <path
                    d="M1 23L12 12L1 1"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* View More Capsule Button */}
            {data.ctaText && (
              <Link
                href={data.ctaHref || "#"}
                className="w-full"
                onClick={(e) => {
                  const href = data?.ctaHref;
                  if (!href || href === "#") {
                    e.preventDefault();
                    handleNext();
                  }
                }}
              >
                <div
                  className="w-full py-4 rounded-full bg-[#756F3F] text-white font-bold font-anaheim text-center uppercase tracking-wider shadow-md active:bg-[#5D5732] active:scale-[0.98] transition-all"
                >
                  {data.ctaText}
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ImageBox({ src, id }: { src: any; id: string }) {
  const imageUrl = typeof src === "string" ? src : src?.url;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id + imageUrl}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full overflow-hidden shadow-2xl"
        style={{ borderRadius: vw(30), backgroundColor: "#F0F0F0" }}
      >
        <OptimizedImage
          image={src}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          alt="Detail Case"
          size="large"
          loading="eager"
        />
      </motion.div>
    </AnimatePresence>
  );
}
