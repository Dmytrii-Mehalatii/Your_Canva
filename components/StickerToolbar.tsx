import Image from "next/image";

export default function StickerBar() {
  return (
    <div className="w-60 h-60 border-[conic-gradient()]  bg-[conic-gradient(#ffecec_0deg_45deg,#fff7f7_45deg_90deg,#ffecec_90deg_135deg,#fff7f7_135deg_180deg,#ffecec_180deg_225deg,#fff7f7_225deg_270deg,#ffecec_270deg_315deg,#fff7f7_315deg_360deg)] rounded-full border-0 shadow-[0_2px_4px_0_rgba(255,192,196,1)] absolute left-1/2 -translate-x-1/2 ml-[240px] bottom-[132px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white border-1 border-red-300 rounded-full z-10"></div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute translate-y-[-80px] cursor-pointer translate-x-[-35px]  text-blue-600  font-bold text-xl">
          <Image
            src="/yes2.png"
            alt="image"
            width={70}
            height={30}
          />
        </div>
        <div className="absolute translate-y-[-80px] cursor-pointer translate-x-[35px]  text-red-500 font-bold text-xl">
          <Image
            src="/no.png"
            alt="image"
            width={60}
            height={30}
          />
        </div>
        <div className="absolute translate-y-[-30px] cursor-pointer translate-x-[-80px]  text-green-600 text-3xl">
          <Image
            src="/questionMark.png"
            alt="image"
            width={40}
            height={100}
          />
        </div>
        <div className="absolute translate-y-[-30px] cursor-pointer translate-x-[80px] text-orange-500 text-3xl">
          <Image
            src="/handDown.png"
            alt="image"
            width={50}
            height={80}
          />
        </div>
        <div className="absolute translate-y-[30px] cursor-pointer translate-x-[-80px]  text-yellow-500 text-3xl">
          <Image
            src="/handUp.png"
            alt="image"
            width={50}
            height={80}
          />
        </div>
        <div className="absolute translate-y-[80px] cursor-pointer translate-x-[-35px]  text-red-500 text-3xl">
          <Image
            src="/heartEmote.png"
            alt="image"
            width={55}
            height={100}
          />
        </div>
        <div className="absolute translate-y-[80px] cursor-pointer translate-x-[35px]  text-blue-500 text-3xl">
          <Image
            src="/star.png"
            alt="image"
            width={55}
            height={100}
          />
        </div>
        <div className="absolute translate-y-[35px] cursor-pointer translate-x-[80px] text-green-600 text-3xl">
          <Image
            src="/blablamark.png"
            alt="image"
            width={40}
            height={100}
          />
        </div>
      </div>
    </div>
  );
}
