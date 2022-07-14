import React from 'react';
import { css } from 'styled-components'
import styled from '@redocly/reference-docs/lib/redoc-lib/src/styled-components';
import { DropdownProps } from "@redocly/reference-docs/lib/components/common/Dropdown";

const ArrowSvg:React.FC<{
  className?:string,
  style:object;
}> = (props) => {
  return (
    <svg
    {...{
      className: props.className,
      style: props.style,
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }}
    >
      <polyline points='6 9 12 15 18 9'/>
    </svg>
  )
}

const ArrowIcon = styled(ArrowSvg)`
position: absolute;
pointer-events: none;
z-index: 1;
top: 50%;
 -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  right: 8px;
  margin: auto;
  text-align: center;
  polyline {
    color: "${prop => prop.variant || "white"}";
  }"
`
const DropdownComponent:React.FC<DropdownProps>= (props) => {
  const { options, onChange, placeholder, value, className, variant } = props;
  const val = value || "";
  return (
    <div  className={`${className} dropdown-wrapper`}>
      <ArrowIcon variant={variant || "light"}/>
      <select
      value={val}
      className="dropdown-select"
      onChange={(e) => {
        const { selectedIndex } = e.target;
        onChange(options[placeholder ? selectedIndex - 1 : selectedIndex ])
      }}
      >
        {placeholder && <option disabled={true} hidden={true} value={placeholder}>{placeholder}</option>}
        {
          options.map((val, index) => {
            const { idx, value, title } = val;
            return (<option key={idx || value+title} value={value} className="dropdown-option">{title || value}</option>)
          })
        }
      </select>
      <label>{val}</label>
    </div>
  )
}

const DropdownMemo = React.memo(DropdownComponent);

const darkDropdownStyle = css`
  background-color: ${prop => prop.theme.rightPanel.panelControlsBackgroundColor};
  border-color: ${prop => prop.theme.rightPanel.panelControlsBackgroundColor};
  color: ${prop => prop.theme.colors.text.light};
  &,&:hover,&:focus-within {
    border: none;
    box-shadow: none;
  }
`
;
export const Dropdown = styled(DropdownMemo)`
  box-sizing: border-box;
  outline: none;
  display: inline-block;
  border-radius: ${prop => prop.theme.shape.borderRadius};
  vertical-align: bottom;
  position: relative;
  width: ${prop => prop.fullWidth ? "100%" : "auto"};
  cursor: pointer;
  text-transform: none;
  label {
    box-sizing: border-box;
    min-width: 90px;
    outline: none;
    display: inline-block;
    color: ${prop => prop.theme.colors.text.primary};
    border-radius: ${prop => prop.theme.shape.borderRadius};
    padding: ${prop =>  prop.dense ? "2px 24px 2px 8px" : "8px 26px 8px 10px"};
    vertical-align: bottom;
    width: ${prop => prop.fullWidth ? "100%" : "auto"};
    text-transform: none;
    line-height: inherit;
    font-size: 14px;
    font-family: inherit;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    &,&:hover,&:focus-within {
      border: 1px solid ${prop => prop.theme.colors.border.light};
      box-shadow: none;
    }
    ${prop => prop.variant === 'dark' ? darkDropdownStyle : ""};
  }
  .dropdown-select {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    border: none;
    appearance: none;
    cursor: pointer;
    color: ${prop => prop.theme.colors.text.primary};
    line-height: inherit;
    font-size: 14px;
    font-family: inherit;
    padding: ${prop => prop.dense ? "2px 24px 2px 8px" : "8px 26px 8px 10px"};
    ${prop => prop.variant  === "dark" ? darkDropdownStyle : ""};
  }`