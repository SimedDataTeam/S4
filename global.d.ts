// // global.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    "snomed-ecl-builder": {
      key: string;
      apiurl: string;
      branch: string;
      showoutput: string;
      ref: React.RefObject<HTMLDivElement>;
    };
  }
}
