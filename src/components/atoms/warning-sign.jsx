function WarningSign(props) {
  const title = props.title || "warning sign";

  return (
    <svg
      height="48"
      width="48"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      <g>
        <path
          d="M45.521,39.04,27.527,5.134a3.982,3.982,0,0,0-7.054,0L2.479,39.04a4.056,4.056,0,0,0,.108,4.017A3.967,3.967,0,0,0,6.007,45H41.993a3.967,3.967,0,0,0,3.42-1.943A4.056,4.056,0,0,0,45.521,39.04Z"
          fill="#f7bf26"
        />
        <polygon
          fill="#363636"
          points="26.286 16 25.143 32.571 22.857 32.571 21.714 16 26.286 16"
        />
        <circle cx="24" cy="38" fill="#363636" r="3" />
      </g>
    </svg>
  );
}

export default WarningSign;
