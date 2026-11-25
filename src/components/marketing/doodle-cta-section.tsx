import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Dark charcoal pre-footer CTA band overlaid with the full seamless 10000x10000
 * geometric doodle pattern fading smoothly into the charcoal footer below.
 */
export function DoodleCtaSection() {
  return (
    <section className="relative overflow-hidden bg-charcoal text-white">
      {/* Full seamless geometric doodle pattern */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="boardscape-prefooter-pattern"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            <g transform="scale(0.024)" fill="none">
              <path d="M5515.53 579.082L5445.52 1926.91" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M4786.4 2034.71C4964.95 2332.29 5438.26 2781.1 5903.17 2195.75" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M6294.13 2179.67C6462.17 2416.56 6846.56 2911.35 7039.81 2995.37L7466.91 2179.67L8398.14 2694.3" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M6288.84 3273.66L7346.1 3833.8L6926 4589.98" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M4755.45 4659.13C5151.04 4655.63 5921.23 4832.07 5837.21 5565.85C5753.19 6299.63 5421.78 6399.06 5266.57 6357.05" strokeWidth="260" strokeLinecap="square" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M5838.79 6585.56L6459.38 6621.41L6256.24 7598.69" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M4581 6858.78C4788.04 7076.38 5323.74 7428.15 5810.22 7094.42" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M-590.027 7397.43C-527.754 7066.7 -127.411 6275.98 1292.05 5835" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M9409.97 7397.43C9472.25 7066.7 9872.59 6275.98 11292.1 5835" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M8234.77 3529.02L7624.43 3001.2" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M2157.5 5014.41L3344.29 4422.77V5564.04L4555.58 5014.41L4005.95 6435.76" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M3961.19 8967.96C4188.75 8867.6 4739.78 8727.1 5123.47 8967.96" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M3808.68 7849.59C4030.4 7562.52 4585.17 7160.63 5030.48 7849.59" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M1909.43 9531.04C1481.95 9565.16 659.118 9396.92 787.597 8451" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M6630.65 7923C6686.06 8262.32 7057.34 8895.73 8099.24 8714.83" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M-704.002 2194.46C-287.812 2025.03 720.433 1860.29 1423.89 2556.79" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M9296 2194.46C9712.19 2025.03 10720.4 1860.29 11423.9 2556.79" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M5844.11 8138.44L5555 8717.85" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M8410 1767L8807 2051V2612.5L9473 2704" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M4373.21 9377.52L3830.17 10172.3L3430.28 9499.83L2857.02 10279.1L2706.51 9234.94" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M4373.21 -622.483L3830.17 172.325L3430.28 -500.164L2857.02 279.102L2706.51 -765.054" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M8453.94 314C8267.9 562.741 7934.9 1123.5 8091.23 1376.64" strokeWidth="260" strokeLinecap="round" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M8534.81 4193.78C8552.37 4124.16 8510.16 4053.5 8440.54 4035.94C8370.92 4018.39 8300.26 4060.59 8282.7 4130.21L8167.7 4586.3L7625.75 4450.61C7556.1 4433.17 7485.51 4475.49 7468.07 4545.14C7450.63 4614.78 7492.95 4685.38 7562.6 4702.82L8104.13 4838.41L7988.4 5297.4C7970.84 5367.02 8013.05 5437.69 8082.66 5455.24C8152.28 5472.8 8222.95 5430.59 8240.5 5360.97L8356.34 4901.57L8880.19 5032.73C8949.84 5050.17 9020.43 5007.85 9037.87 4938.2C9055.31 4868.55 9012.99 4797.96 8943.34 4780.52L8419.91 4649.46L8534.81 4193.78Z" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" />
              <path d="M685.636 -222.216C703.19 -291.834 660.984 -362.501 591.366 -380.055C521.748 -397.609 451.082 -355.402 433.528 -285.785L318.523 170.309L-223.425 34.6106C-293.072 17.1718 -363.668 59.4947 -381.107 129.142C-398.546 198.788 -356.223 269.385 -286.576 286.824L254.954 422.417L139.219 881.407C121.665 951.025 163.871 1021.69 233.489 1039.25C303.107 1056.8 373.774 1014.59 391.328 944.977L507.168 485.569L1031.01 616.734C1100.66 634.173 1171.26 591.85 1188.7 522.203C1206.13 452.557 1163.81 381.96 1094.17 364.521L570.737 233.46L685.636 -222.216Z" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" />
              <path d="M10685.6 -222.216C10703.2 -291.834 10661 -362.501 10591.4 -380.055C10521.7 -397.609 10451.1 -355.402 10433.5 -285.785L10318.5 170.309L9776.58 34.6106C9706.93 17.1718 9636.33 59.4947 9618.89 129.142C9601.45 198.788 9643.78 269.385 9713.42 286.824L10255 422.417L10139.2 881.407C10121.7 951.025 10163.9 1021.69 10233.5 1039.25C10303.1 1056.8 10373.8 1014.59 10391.3 944.977L10507.2 485.569L11031 616.734C11100.7 634.173 11171.3 591.85 11188.7 522.203C11206.1 452.557 11163.8 381.96 11094.2 364.521L10570.7 233.46L10685.6 -222.216Z" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" />
              <path d="M685.636 9777.78C703.19 9708.17 660.984 9637.5 591.366 9619.95C521.748 9602.39 451.082 9644.6 433.527 9714.22L318.523 10170.3L-223.425 10034.6C-293.072 10017.2 -363.668 10059.5 -381.107 10129.1C-398.546 10198.8 -356.223 10269.4 -286.576 10286.8L254.954 10422.4L139.219 10881.4C121.665 10951 163.871 11021.7 233.489 11039.2C303.107 11056.8 373.774 11014.6 391.328 10945L507.168 10485.6L1031.01 10616.7C1100.66 10634.2 1171.26 10591.9 1188.7 10522.2C1206.13 10452.6 1163.81 10382 1094.16 10364.5L570.737 10233.5L685.636 9777.78Z" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" />
              <path d="M1827.24 4494.81C1772.45 4448.4 1690.42 4455.19 1644.02 4509.97L1392.63 4806.73L1297.76 4708.3C1247.93 4656.61 1165.64 4655.1 1113.94 4704.92C1062.25 4754.75 1060.73 4837.04 1110.56 4888.74L1223.71 5006.13L1013.48 5254.32C967.07 5309.1 973.86 5391.13 1028.64 5437.54C1083.43 5483.95 1165.46 5477.16 1211.86 5422.37L1405.07 5194.29L1549.93 5344.58C1599.76 5396.28 1682.06 5397.79 1733.75 5347.97C1785.44 5298.14 1786.96 5215.84 1737.13 5164.15L1573.99 4994.89L1842.4 4678.03C1888.81 4623.24 1882.02 4541.21 1827.24 4494.81Z" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" />
              <path d="M2255.57 773.514C2240.94 703.223 2172.1 658.098 2101.81 672.725L890.514 924.786C820.223 939.413 775.098 1008.25 789.725 1078.54C804.353 1148.84 873.192 1193.96 943.483 1179.33L2154.78 927.272C2225.07 912.645 2270.19 843.805 2255.57 773.514ZM2337.79 1259.65C2321.22 1189.79 2251.16 1146.59 2181.3 1163.16L956.002 1453.73C886.143 1470.3 842.94 1540.36 859.507 1610.22C876.073 1680.08 946.136 1723.28 1016 1706.71L2241.29 1416.14C2311.15 1399.58 2354.35 1329.51 2337.79 1259.65Z" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" />
              <path d="M3732.6 3434.58C3721.82 3363.6 3655.53 3314.8 3584.55 3325.59C3513.57 3336.37 3464.77 3402.66 3475.55 3473.64L3626.09 4464.38C3636.87 4535.36 3703.16 4584.16 3774.14 4573.37C3845.12 4562.59 3893.92 4496.3 3883.14 4425.32L3732.6 3434.58ZM4203.19 3446.57C4196.94 3375.05 4133.9 3322.13 4062.37 3328.38C3990.85 3334.62 3937.93 3397.67 3944.18 3469.19L4014.19 4270.89C4020.44 4342.41 4083.48 4395.33 4155.01 4389.08C4226.53 4382.84 4279.45 4319.79 4273.21 4248.27L4203.19 3446.57Z" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" />
              <path d="M2877.82 921.312C2844.6 908.825 2807.71 910.464 2775.73 925.848C2743.75 941.232 2719.44 969.023 2708.46 1002.77L2372.38 2035.52C2350.16 2103.79 2387.5 2177.15 2455.77 2199.37C2524.04 2221.59 2597.4 2184.25 2619.62 2115.98L2913.62 1212.53L3801.59 1546.28C3868.79 1571.54 3943.75 1537.54 3969.01 1470.33C3994.28 1403.12 3960.27 1328.16 3893.06 1302.9L2877.82 921.312ZM3231.72 1677.2C3219.82 1606.39 3152.77 1558.64 3081.97 1570.54C3011.16 1582.44 2963.41 1649.49 2975.31 1720.29C3027.22 2029.15 3314.1 2699.5 4057.07 2992.46C4123.86 3018.8 4199.36 2986 4225.7 2919.21C4252.03 2852.42 4219.24 2776.92 4152.44 2750.59C3517.48 2500.22 3273.17 1923.81 3231.72 1677.2Z" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" />
              <path d="M3294.69 7293.52C3237.54 7250.06 3155.98 7261.16 3112.52 7318.31L2528.52 8086.31C2485.06 8143.46 2496.16 8225.02 2553.31 8268.48C2610.46 8311.94 2692.02 8300.84 2735.48 8243.69L3319.48 7475.69C3362.94 7418.54 3351.84 7336.98 3294.69 7293.52ZM2287.26 7704.18C2279.63 7632.79 2215.57 7581.1 2144.18 7588.74C2072.79 7596.37 2021.1 7660.43 2028.74 7731.82L2133.83 8714.82C2137.63 8750.31 2155.85 8782.68 2184.22 8804.33C2212.59 8825.99 2248.61 8835.03 2283.85 8829.33L3236.75 8675.26C3307.63 8663.8 3355.79 8597.05 3344.33 8526.17C3332.87 8455.3 3266.13 8407.13 3195.25 8418.59L2377.78 8550.77L2287.26 7704.18Z" fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" />
              <rect x="4679.95" y="2822.93" width="1330.32" height="1330.32" rx="75.4997" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M6688.1 2018.16L7411.17 1837.86C7451.63 1827.77 7476.25 1786.79 7466.16 1746.33L7285.86 1023.26C7275.77 982.798 7234.79 958.179 7194.33 968.267L6471.26 1148.57C6430.8 1158.66 6406.18 1199.64 6416.27 1240.1L6596.57 1963.17C6606.66 2003.63 6647.64 2028.25 6688.1 2018.16Z" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M2628.5 7241.85L3444.84 6425.5C3474.33 6396.02 3474.33 6348.22 3444.84 6318.73L2628.5 5502.39C2599.02 5472.9 2551.21 5472.9 2521.73 5502.39L1705.39 6318.73C1675.9 6348.22 1675.9 6396.02 1705.39 6425.5L2521.73 7241.85C2551.21 7271.33 2599.02 7271.33 2628.5 7241.85Z" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M8177.95 7833.9L8999.1 6793.17C9024.92 6760.44 9019.33 6712.96 8986.59 6687.13L7838.1 5780.97C7805.36 5755.14 7757.89 5760.74 7732.06 5793.47L6910.92 6834.2C6885.09 6866.94 6890.69 6914.41 6923.42 6940.24L8071.92 7846.41C8104.65 7872.24 8152.13 7866.64 8177.95 7833.9Z" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <circle cx="6849.64" cy="5516.64" r="454.641" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <circle cx="2496.37" cy="3273.54" r="556.166" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <circle cx="4533.65" cy="799.651" r="496.651" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <circle cx="9420.55" cy="3570.36" r="304.105" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <circle cx="10039.3" cy="4966.05" r="664.692" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <circle cx="39.3521" cy="4966.05" r="664.692" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <circle cx="6800.16" cy="9839.31" r="776.719" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <circle cx="6800.16" cy="-160.688" r="776.719" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M459.989 7621.56L1433.71 8085.33C1486.18 8110.32 1546.03 8069.14 1541.44 8011.2L1456.22 6936.05C1451.62 6878.11 1386.03 6846.87 1338.15 6879.82L449.656 7491.2C401.776 7524.15 407.517 7596.57 459.989 7621.56Z" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M8415.21 9498.51L9891.08 9337.56C9948.68 9331.28 9978.03 9265.15 9944.05 9218.23L9064.93 8004.09C9030.63 7956.72 8957.81 7964.66 8934.52 8018.32L8337.76 9393.4C8314.7 9446.54 8357.61 9504.79 8415.21 9498.51Z" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M10008.4 876.828L9034.68 413.056C8982.2 388.065 8922.35 429.247 8926.95 487.185L9012.17 1562.34C9016.76 1620.28 9082.35 1651.52 9130.23 1618.57L10018.7 1007.19C10066.6 974.242 10060.9 901.82 10008.4 876.828Z" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M8.40203 876.828L-965.32 413.056C-1017.79 388.065 -1077.64 429.247 -1073.05 487.185L-987.826 1562.34C-983.234 1620.28 -917.644 1651.52 -869.764 1618.57L18.735 1007.19C66.6145 974.242 60.874 901.82 8.40203 876.828Z" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M9869.38 7823.65L10538.8 8669.3C10574.9 8714.87 10646.7 8704.3 10668.2 8650.27L11065.8 7647.73C11087.2 7593.7 11042.2 7536.74 10984.7 7545.2L9917.6 7702.09C9860.1 7710.55 9833.31 7778.08 9869.38 7823.65Z" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <path d="M383.07 3534.9L1132.47 4204.12C1175.82 4242.83 1244.82 4220.1 1256.67 4163.2L1461.53 3179.6C1473.38 3122.7 1419.19 3074.31 1363.99 3092.49L409.734 3406.88C354.533 3425.07 339.72 3496.19 383.07 3534.9Z" strokeWidth="260" strokeLinejoin="round" stroke="#FFFFFF" />
              <circle cx="4104.73" cy="2036.31" r="143.535" fill="#FFFFFF" />
              <circle cx="6397.65" cy="4207.68" r="143.535" fill="#FFFFFF" />
              <circle cx="690.535" cy="2851.53" r="143.535" fill="#FFFFFF" />
              <circle cx="1800.53" cy="43.5347" r="143.535" fill="#FFFFFF" />
              <circle cx="1800.53" cy="10043.5" r="143.535" fill="#FFFFFF" />
              <circle cx="1524.97" cy="8855.32" r="143.535" fill="#FFFFFF" />
              <circle cx="4412.01" cy="8185.76" r="143.535" fill="#FFFFFF" />
              <circle cx="5173.53" cy="9662.53" r="143.535" fill="#FFFFFF" />
              <circle cx="7489.53" cy="8013.53" r="143.535" fill="#FFFFFF" />
              <circle cx="3875.21" cy="7063.08" r="143.535" fill="#FFFFFF" />
              <circle cx="6799.53" cy="9838.53" r="143.535" fill="#FFFFFF" />
              <circle cx="747.085" cy="6706.34" r="143.535" fill="#FFFFFF" />
              <circle cx="5016.01" cy="5590.84" r="143.535" fill="#FFFFFF" />
              <circle cx="7954.53" cy="6813.53" r="143.535" fill="#FFFFFF" />
              <circle cx="8941.53" cy="5904.53" r="143.535" fill="#FFFFFF" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#boardscape-prefooter-pattern)" />
      </svg>

      {/* Smooth vertical fade into the charcoal footer below */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-charcoal/60 to-charcoal sm:h-44"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-sans text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              Ready to put your brand on the street?{" "}
              <span className="block text-neutral-400">
                Let&apos;s plan the corridors.
              </span>
            </h2>
            <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-neutral-300 sm:text-base">
              Share your campaign brief, target districts, and flight dates. We&apos;ll
              return operator-confirmed availability and a structured outdoor plan.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/brief"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-limebrand px-6 text-sm font-bold text-charcoal transition-colors hover:bg-limebrand-500 sm:w-auto"
            >
              Start a Campaign Brief
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/atlas"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-charcoal-800 px-6 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 sm:w-auto"
            >
              Explore Atlas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
