import React from 'react';
import {Composition} from 'remotion';
import {Promo} from './Promo';
import {Stage} from './fx';
import {FPS, H, W} from './brand';
import {SCENES} from './scenes';
import {SCENE_FRAMES, TOTAL_FRAMES} from './timing';

// One isolated composition per scene (same length as its slot in the promo), for stills and review.
const isolated = Object.fromEntries(
  SCENE_FRAMES.map(({id}) => {
    const Scene = SCENES[id];
    const C: React.FC = () => (
      <Stage>
        <Scene />
      </Stage>
    );
    return [id, C];
  }),
);

export const Root: React.FC = () => (
  <>
    <Composition id="RoomMePromo" component={Promo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    {SCENE_FRAMES.map(({id, dur}) => (
      <Composition key={id} id={`Scene-${id}`} component={isolated[id]} durationInFrames={dur} fps={FPS} width={W} height={H} />
    ))}
  </>
);
