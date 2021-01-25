import * as React from "react";
import Svg, { Path, Circle, Rect } from "react-native-svg";

export function StarIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            color={"red"}
            width={10}
            height={10}
            viewBox="0 0 24 24"
            fill="red"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-star"
            {...props}
        >
            <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
    )
}

export function CameraIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            color={"#000"}
            width={30}
            height={30}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-camera"
            {...props}
        >
            <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <Circle cx={12} cy={13} r={4} />
        </Svg>
    )
}

export function PhoneIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-phone"
            {...props}
        >
            <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </Svg>
    )
}

export function UploadFileIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={30}
            height={30}
            color={"#000"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-upload"
            {...props}
        >
            <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </Svg>
    )
}

export function DeleteIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-trash"
            {...props}
        >
            <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </Svg>
    )
}

export function PhoneCallIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-phone-call"
            {...props}
        >
            <Path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94m-1 7.98v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </Svg>
    )
}

export function CheckIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-check"
            {...props}
        >
            <Path d="M20 6L9 17l-5-5" />
        </Svg>
    )
}

export function PlusIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-plus"
            {...props}
        >
            <Path d="M12 5v14M5 12h14" />
        </Svg>
    )
}

export function MinusIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-minus"
            {...props}
        >
            <Path d="M5 12h14" />
        </Svg>
    )
}

export function SearchIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-search"
            {...props}
        >
            <Circle cx={11} cy={11} r={8} />
            <Path d="M21 21l-4.35-4.35" />
        </Svg>
    )
}

export function ArrowLeftIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-arrow-left"
            {...props}
        >
            <Path d="M19 12H5M12 19l-7-7 7-7" />
        </Svg>
    )
}

export function ArrowRightIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-arrow-right"
            {...props}
        >
            <Path d="M5 12h14M12 5l7 7-7 7" />
        </Svg>
    )
}

export function MenuIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-menu"
            {...props}
        >
            <Path d="M3 12h18M3 6h18M3 18h18" />
        </Svg>
    )
}

export function MapMarkerIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={40}
            height={40}
            viewBox="0 0 425.963 425.963"
            {...props}
        >
            <Path d="M213.285 0h-.608C139.114 0 79.268 59.826 79.268 133.361c0 48.202 21.952 111.817 65.246 189.081 32.098 57.281 64.646 101.152 64.972 101.588a4.8 4.8 0 003.847 1.934c.043 0 .087 0 .13-.002a4.805 4.805 0 003.868-2.143c.321-.486 32.637-49.287 64.517-108.976 43.03-80.563 64.848-141.624 64.848-181.482C346.693 59.825 286.846 0 213.285 0zm61.58 136.62c0 34.124-27.761 61.884-61.885 61.884-34.123 0-61.884-27.761-61.884-61.884s27.761-61.884 61.884-61.884c34.124 0 61.885 27.761 61.885 61.884z" />
        </Svg>
    )
}

export function RefreshIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-refresh-cw"
            {...props}
        >
            <Path d="M23 4v6h-6M1 20v-6h6" />
            <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </Svg>
    )
}

export function SaveIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-save"
            {...props}
        >
            <Path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <Path d="M17 21v-8H7v8M7 3v5h8" />
        </Svg>
    )
}

export function BarcodeScannerIcon(props) {
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" {...props}>
            <Path d="M80 48H16C7.168 48 0 55.168 0 64v64c0 8.832 7.168 16 16 16s16-7.168 16-16V80h48c8.832 0 16-7.168 16-16s-7.168-16-16-16zM464 336c-8.832 0-16 7.168-16 16v48h-48c-8.832 0-16 7.168-16 16s7.168 16 16 16h64c8.832 0 16-7.168 16-16v-64c0-8.832-7.168-16-16-16zM464 48h-64c-8.832 0-16 7.168-16 16s7.168 16 16 16h48v48c0 8.832 7.168 16 16 16s16-7.168 16-16V64c0-8.832-7.168-16-16-16zM80 400H32v-48c0-8.832-7.168-16-16-16s-16 7.168-16 16v64c0 8.832 7.168 16 16 16h64c8.832 0 16-7.168 16-16s-7.168-16-16-16zM64 112h32v256H64zM128 112h32v192h-32zM192 112h32v192h-32zM256 112h32v256h-32zM320 112h32v192h-32zM384 112h32v256h-32zM128 336h32v32h-32zM192 336h32v32h-32zM320 336h32v32h-32z" />
        </Svg>
    )
}

export function CurrentLocationIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            aria-labelledby="title"
            aria-describedby="desc"
            fill='red'
            width={20}
            height={25}
            {...props}
        >
            <Path
                data-name="layer2"
                fill="none"
                stroke="#202020"
                strokeMiterlimit={10}
                strokeWidth={5}
                d="M32 2v60m30-30H2"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <Circle
                data-name="layer1"
                cx={32}
                cy={32}
                r={24}
                fill="none"
                stroke="#202020"
                strokeMiterlimit={10}
                strokeWidth={5}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <Circle
                data-name="layer1"
                cx={32}
                cy={32}
                fill="none"
                stroke="#202020"
                strokeMiterlimit={10}
                strokeWidth={5}
                strokeLinejoin="round"
                strokeLinecap="round"
                r={11}
            />
        </Svg>
    )
}

export function RemoveMarkerIcon(props) {
    return (
        <Svg
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            aria-labelledby="title"
            aria-describedby="desc"
            {...props}
        >
            <Path
                strokeWidth={4}
                strokeMiterlimit={10}
                stroke="#202020"
                fill="none"
                d="M32 2a20 20 0 00-20 20c0 18 20 39 20 39s20-21 20-39A20 20 0 0032 2z"
                data-name="layer2"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <Path
                d="M26 16l12 12m0-12L26 28"
                strokeWidth={4}
                strokeMiterlimit={10}
                stroke="#202020"
                fill="none"
                data-name="layer1"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
        </Svg>
    )
}

export function CrossIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-x"
            {...props}
        >
            <Path d="M18 6L6 18M6 6l12 12" />
        </Svg>
    )
}

export function CalendarIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-calendar"
            {...props}
        >
            <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
            <Path d="M16 2v4M8 2v4M3 10h18" />
        </Svg>
    )
}

export function SearchLocationIcon(props) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="prefix__feather prefix__feather-crosshair"
            {...props}
        >
            <Circle cx={12} cy={12} r={10} />
            <Path d="M22 12h-4M6 12H2M12 6V2M12 22v-4" />
        </Svg>
    )
}

export function BackIosIcon(props) {
    return (
        <Svg
          xmlns="http://www.w3.org/2000/svg"
          width={27}
          height={27}
          viewBox="0 0 27 27"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          color="#fff"
          className="prefix__feather prefix__feather-chevron-left"
          {...props}
        >
          <Path d="M15 18l-6-6 6-6" />
        </Svg>
      )
  }



















