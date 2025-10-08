import "material-symbols";

export default function IconButton(props: {
  icon: string;
  size?: number;
  color: string;
  onClick?: () => void;
}) {
  return (
    //I decided to use props.size to define different icons which isnt used in the toolbar, its a little bit weird so I left this comment here to not forgot about that xD
    <div
      className={`flex items-center justify-center ${props.size ? "" : "w-[78px]"} h-full `}
    >
      <button
        className={`${props.size ? `w-${props.size} h-${props.size}` : "w-12 h-12"} flex items-center justify-center rounded-xl hover:cursor-pointer`}
        onClick={props.onClick}
      >
        <span
          className={`material-symbols-outlined ${props.size ? "" : "scale-165"}`}
          style={{ color: props.color }}
        >
          {props.icon}
        </span>
      </button>
    </div>
  );
}
