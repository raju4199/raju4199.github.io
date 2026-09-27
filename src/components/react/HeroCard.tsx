import ProfileCard from '@/components/reactbits/ProfileCard';

interface Props {
  photo: string;
  name: string;
}

/** Tilting holographic photo card, without text overlays. */
export default function HeroCard({ photo, name }: Props) {
  return (
    <ProfileCard
      avatarUrl={photo}
      iconUrl="/images/card-pattern.svg"
      grainUrl=""
      name={name}
      showDetails={false}
      showUserInfo={false}
      innerGradient="linear-gradient(145deg, rgba(20, 83, 45, 0.55) 0%, rgba(8, 145, 178, 0.28) 100%)"
      behindGlowColor="rgba(62, 224, 138, 0.45)"
      behindGlowSize="55%"
      enableTilt
      enableMobileTilt={false}
    />
  );
}
