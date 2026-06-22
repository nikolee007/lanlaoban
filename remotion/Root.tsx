import React from 'react'
import { Composition } from 'remotion'
import PromotionVideo, { PromotionVideoProps } from './PromotionVideo'

const DEFAULT_PROPS: PromotionVideoProps = {
  photos: [],
  productName: 'Product',
  slogans: [],
  duration: 1800, // 60 seconds at 30fps
}

// Wrapper to satisfy Remotion Composition's LooseComponentType constraint
const WrappedPromotionVideo = ((props: Record<string, unknown>) => (
  <PromotionVideo {...(props as unknown as PromotionVideoProps)} />
)) as React.FC<Record<string, unknown>>

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromotionVideo"
        component={WrappedPromotionVideo}
        durationInFrames={DEFAULT_PROPS.duration}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_PROPS}
      />
    </>
  )
}
