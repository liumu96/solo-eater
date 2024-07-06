import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useVideo } from "./VideoContext";
import { useFaceMesh } from "@/hooks/useFaceMesh";
import useSignalProcessing from "@/hooks/useSignalProcessing";
import { avgFrequency } from "@/utils/avgFrequency";
import useVideoRef from "@/hooks/useVideoRef";

// 定义上下文类型
interface ChewingFrequencyContextType {
  chewingFrequency: number | null;
}

// 创建上下文
const ChewingFrequencyContext = createContext<ChewingFrequencyContextType>({
  chewingFrequency: null,
});

// 自定义 hook 来使用上下文
export const useChewingFrequency = () => useContext(ChewingFrequencyContext);

// Chewing Frequency Provider
export const ChewingFrequencyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const videoRef = useVideoRef();
  const [chewingFrequency, setChewingFrequency] = useState<number | null>(null);
  const [cutOffFrequency, setCutOffFrequency] = useState(0.5);
  const [itemsNo, setItemsNo] = useState(160);

  const {
    animate,
    leftEyePoint,
    rightEyePoint,
    euclideanDistance,
  } = useFaceMesh(videoRef);
  
    const signalProcessingData = useSignalProcessing(
      animate,
      leftEyePoint,
      rightEyePoint,
      euclideanDistance,
      cutOffFrequency,
      itemsNo
    );

  // 设置咀嚼频率值的逻辑
  useEffect(() => {
    const calculateChewingFrequency = () => {
      setChewingFrequency(avgFrequency(signalProcessingData.filteredPeaks, 5));
    };
    // 执行计算咀嚼频率的逻辑
    calculateChewingFrequency();
  }, [animate]);

  // 创建提供的值，供消费者使用
  const contextValue: ChewingFrequencyContextType = {
    chewingFrequency: chewingFrequency,
  };
  
  // 返回包含提供程序的 JSX
  return (
    <ChewingFrequencyContext.Provider value={contextValue}>
      {children}
    </ChewingFrequencyContext.Provider>
  );
};
