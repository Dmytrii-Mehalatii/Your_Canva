import "material-symbols";

export default function IconButton(props: {
  icon: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center justify-center w-[78px] h-full ">
      <button
        className="w-12 h-12 flex items-center justify-center rounded-xl hover:cursor-pointer"
        onClick={props.onClick}
      >
        <span className="material-symbols-outlined scale-165 text-[#D7000F]">
          {props.icon}
        </span>
      </button>
    </div>
  );
}
