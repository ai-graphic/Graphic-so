

type ImageContentDisplayProps = {
    url: string;
};

export const ImageContentDisplay: React.FC<ImageContentDisplayProps> = ({ url }) => {
    return <img src={url} height={200} alt="AI generated content" />;
};