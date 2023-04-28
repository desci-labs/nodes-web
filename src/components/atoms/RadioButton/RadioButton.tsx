import './style.css'

const RadioButton = (props: any) => {
  return (
    <div className={`flex flex-row items-center gap-2`}>
      <div className={`
        flex items-center justify-center
        ${props.checked ? 'border-[6px]' : 'border-2'} border-tint-primary
        bg-transparent
        w-5 h-5
        rounded-full
      `} />
      {/* <input
        type="radio"
        checked={props.checked}
        // className="dark:border-tint-primary dark:focus:ring-red-500"
        className="text-tint-primary bg-gray-100 border-gray-300 focus:ring-tint-primary dark:focus:ring-tint-primary dark:ring-offset-gray-800 focus:ring-2 dark:focus:bg-transparent dark:bg-transparent dark:border-tint-primary border-2"
      /> */}
      <p className={props.labelClassName}>
        {props.label }
      </p>
    </div>
  )
}

export default RadioButton