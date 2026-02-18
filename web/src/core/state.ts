export type DataPoint = { t: string; close: number };

export type AppState = {
  series: DataPoint[];
  seriesName: string;
  index: number;
  isPlaying: boolean;
};

export function createInitialState(series: DataPoint[], name: string): AppState {
  return { series, seriesName: name, index: 0, isPlaying: false };
}
