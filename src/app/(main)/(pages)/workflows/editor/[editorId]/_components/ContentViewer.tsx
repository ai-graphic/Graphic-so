type Props = {
  url: string;
};

const ContentViewer = ({ url }: Props) => {
  return (
    <div className="flex justify-center">
      {/https?:\/\/.*\.(?:png|jpg|gif|webp|ico)/.test(url) ? (
        <img src={url} alt="bot" />
      ) : /https?:\/\/.*\.(?:mp4|webm|ogg)/.test(url) ? (
        <video src={url} controls width="320" height="240" />
      ) : /https?:\/\/.*\.(?:mp3)/.test(url) ? (
        <audio src={url} controls />
      ) : (
        <p>{url}</p>
      )}
    </div>
  );
};

export default ContentViewer;
