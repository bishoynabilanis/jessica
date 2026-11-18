import { Composition } from 'remotion'
import { Intro } from './Intro'

export const RemotionRoot = () => {
  return (
    <Composition
      id="JessicaIntro"
      component={Intro}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1920}
    />
  )
}
