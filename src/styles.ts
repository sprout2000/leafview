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
  transition: opacity 0.8s ease-in-out;
`;

export const Toolbar = styled.div`
  display: flex;
  height: 60px;
  align-items: center;
  padding: 0 24px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.7);
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
  color: rgb(199, 199, 204);
  &:hover {
    cursor: pointer;
  }
  &:active {
    color: rgb(255, 255, 255);
  }
`;

export const View = styled.div<{ init: boolean }>`
  height: 100%;
  z-index: 0;
  background-color: transparent;
  cursor: ${({ init }): string => (init ? 'default' : 'grab')};
`;
