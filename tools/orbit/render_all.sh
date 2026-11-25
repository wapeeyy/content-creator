#!/bin/bash
# Re-render every ORBIT asset: brand stills, 4 videos (SDR -> HDR HLG), voice-over mix.
set -e
export NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt
R=/home/user/content-creator/remotion; O=/home/user/content-creator/out/orbit
cd $R
mkdir -p $O/brand $O/vo
for c in BrandAvatar BrandAvatarWord BrandXHeader BrandHero BrandHeroClean BrandOG; do
  npx remotion still src/index.ts $c $O/brand/$c.png --log=error 2>&1 | grep -v UNDICI | grep -v trace-warnings || true
done
echo "stills done"
declare -A NAME=( [OrbitLaunch]=Launch-9x16 [OrbitLaunchX]=Launch-16x9 [OrbitTutorial]=Tutorial-9x16 [OrbitTutorialX]=Tutorial-16x9 )
for c in OrbitLaunch OrbitLaunchX OrbitTutorial OrbitTutorialX; do
  n=${NAME[$c]}
  npx remotion render src/index.ts $c $O/ORBIT-$n-SDR.mp4 --codec=h264 --crf=16 --audio-codec=aac --log=error --concurrency=4 2>&1 | grep -v UNDICI | grep -v trace-warnings || true
  ffmpeg -hide_banner -loglevel error -y -i $O/ORBIT-$n-SDR.mp4 -vf "zscale=tin=bt709:pin=bt709:min=bt709:rin=tv:t=linear:npl=203,format=gbrpf32le,zscale=p=bt2020:t=arib-std-b67:m=bt2020nc:r=tv:npl=203,format=yuv420p10le" -c:v libx265 -crf 20 -x265-params "colorprim=bt2020:transfer=arib-std-b67:colormatrix=bt2020nc:range=limited:log-level=error" -color_primaries bt2020 -color_trc arib-std-b67 -colorspace bt2020nc -tag:v hvc1 -c:a copy $O/ORBIT-$n-HDR.mp4
  echo "$n done"
done
python3 -I /home/user/content-creator/tools/orbit/mix_vo.py
echo ALL DONE
