declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }

  // 定义一个 Point 类型，表示一个点的 x 和 y 坐标
  type Point = {
    x: number;
    y: number;
  };

  // 定义一个 Keypoint 类型，表示一个关键点，包括 x, y 和 name
  type Keypoint = {
    x: number;
    y: number;
    name: string;
  };

  // 定义一个 Prediction 类型，表示一个预测，包括关键点
  type Prediction = {
    keypoints: Keypoint[];
  };

  // 定义返回类型，用于 getMesh 函数
  type MeshResult = {
    euclideanDistance: { value: number; time: Date } | null;
    eyePoint: Keypoint | null;
    namedKeypoints: { [key: string]: Keypoint[] } | null;
  };

  // 定义视频引用类型
  type VideoRef = React.RefObject<HTMLVideoElement>;

  // 定义新的类型以更好地描述数据
  interface SignalDataItem {
    value: number;
    time: Date;
  }

  interface SignalProcessingResult {
    data: SignalDataItem[];
    filteredData: SignalDataItem[];
    herz: number;
    peaks: SignalDataItem[];
    newFilteredItem: SignalDataItem | null;
    eyePointDistance: SignalDataItem[];
    filteredPeaks: SignalDataItem[];
    removedPeaks: SignalDataItem[];
  }

  interface DanmakuItem {
    id: number;
    text: string;
  }

  // 定义用户信息
  interface UserInfo {
    username: string;
    eatingTime?: number;
    preferences?: Array<string>;
  }

  interface Window {
    gtag: (
      command: "config" | "event",
      targetId: string,
      config?: Record<string, any>
    ) => void;
    GA_INITIALIZED: boolean;
  }
}

export {};
