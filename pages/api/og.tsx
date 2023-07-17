/* eslint-disable react/no-unknown-property */
import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

const regular = fetch(new URL('../../assets/SpaceGrotesk-Regular.ttf', import.meta.url)).then(res => res.arrayBuffer())
const semibold = fetch(new URL('../../assets/SpaceGrotesk-SemiBold.ttf', import.meta.url)).then(res =>
  res.arrayBuffer(),
)

export default async function handler(): Promise<ImageResponse> {
  const regularData = await regular
  const semiboldData = await semibold

  return new ImageResponse(
    (
      <div tw="w-full h-full flex flex-col relative items-center bg-[#f43f5e]">
        <div tw="absolute top-0 left-0 flex flex-col items-center relative text-sm px-32 w-full h-full">
          <div tw="flex">
            <div tw="flex mt-32">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <svg tw="h-48 w-48" viewBox="0 0 1784 1784" fill="none">
                <path
                  d="M842.333 94.3501C748.467 100.217 659 120.217 575 153.95C347.133 245.683 169.667 430.617 87.4 662.217C70.6 709.55 55.8 769.417 48.3333 820.083C43.1333 855.817 39 905.15 39 933.15V946.217H892.333H1745.67V933.15C1745.67 905.15 1741.53 855.817 1736.33 820.083C1717 688.883 1664.87 559.55 1587.53 451.55C1424.87 224.35 1165.4 91.2834 888.333 93.0167C872.6 93.1501 851.933 93.8168 842.333 94.3501Z"
                  fill="#fff"
                />
                <path
                  d="M44.8667 1045.82C46.7333 1065.02 55.6667 1118.35 58.4667 1127.82C59.1334 1130.08 100.067 1130.22 892.333 1130.22C1684.6 1130.22 1725.53 1130.08 1726.2 1127.82C1729 1118.35 1737.93 1065.02 1739.8 1045.82L1740.73 1036.88H892.333H43.9333L44.8667 1045.82Z"
                  fill="#fff"
                />
                <path
                  d="M85.6667 1224.62C85.6667 1228.08 104.467 1275.42 115.267 1299.15L123.4 1316.88H892.333H1661.27L1669.4 1299.15C1680.2 1275.42 1699 1228.08 1699 1224.62C1699 1224.08 1336.07 1223.55 892.333 1223.55C448.733 1223.55 85.6667 1224.08 85.6667 1224.62Z"
                  fill="#fff"
                />
                <path
                  d="M178.733 1414.48C186.333 1426.48 213.267 1463.42 228.2 1481.95L245.133 1502.88H892.333H1539.53L1556.47 1481.95C1571.4 1463.42 1598.33 1426.48 1605.93 1414.48L1608.6 1410.22H892.333H176.067L178.733 1414.48Z"
                  fill="#fff"
                />
                <path
                  d="M343 1598.88C345.533 1601.95 372.333 1623.02 390.333 1636.22C411.267 1651.55 439.933 1670.35 459 1681.42L474.2 1690.22H892.333H1310.47L1325.67 1681.42C1344.73 1670.35 1373.4 1651.55 1394.33 1636.22C1412.33 1623.02 1439.13 1601.95 1441.67 1598.88C1443.13 1597.15 1385.4 1596.88 892.333 1596.88C399.267 1596.88 341.533 1597.15 343 1598.88Z"
                  fill="#fff"
                />
              </svg>
            </div>
          </div>

          <div
            style={{ fontFamily: '"Space Grotesk SemiBold"' }}
            tw="flex text-center mt-8 text-[#fff] tracking-tighter text-6xl"
          >
            Sunrise
          </div>

          <div
            style={{ fontFamily: '"Space Grotesk Regular"' }}
            tw="flex mt-6 text-center text-[#fff] tracking-tighter text-3xl"
          >
            Your friendly Bluesky web client
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Space Grotesk Regular',
          data: regularData,
          style: 'normal',
        },
        {
          name: 'Space Grotesk SemiBold',
          data: semiboldData,
          style: 'normal',
        },
      ],
    },
  )
}
