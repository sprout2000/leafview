import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
  }
  html, body, #root {
    height: 100%;
  }
`;

export const Container = styled.div`
  height: 100%;
  background-color: #323232;
  overflow: hidden;
  user-select: none;
  position: relative;
  grid-row: 1;
`;

export const Initial = styled.div<{ drag: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: dotted 3px;
  border-radius: 6px;
  z-index: 20;
  color: ${({ drag }): string =>
    drag ? 'rgb(242, 242, 247)' : 'rgb(174, 174, 178)'};
  border-color: ${({ drag }): string =>
    drag ? 'rgb(242, 242, 247)' : 'rgb(174, 174, 178)'};
  &:hover {
    cursor: pointer;
  }
  &:active {
    color: rgb(242, 242, 247);
    border-color: rgb(242, 242, 247);
  }
`;

export const Bottom = styled.div`
  position: absolute;
  bottom: 0;
  z-index: 20;
  width: 100%;
  height: 128px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  &:hover {
    opacity: 1;
  }
  transition: opacity 0.8s linear;
`;

export const Toolbar = styled.div`
  display: flex;
  height: 60px;
  align-items: center;
  padding: 0 24px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.5);
  user-select: none;
`;

export const Controls = styled.div`
  width: 96px;
  display: flex;
  justify-content: flex-start;
`;

export const Arrows = styled.div`
  display: flex;
`;

export const Trash = styled.div`
  width: 96px;
  display: flex;
  justify-content: flex-end;
`;

export const Icon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgb(174, 174, 178);
  &:hover {
    cursor: pointer;
  }
  &:active {
    color: rgb(242, 242, 247);
  }
`;

export const View = styled.div`
  height: 100%;
  z-index: 0;
  background-color: transparent;
  cursor: default;
`;
