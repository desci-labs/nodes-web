import { IconWrapperProps } from "../organisms/ComponentLibrary";
import {
  IconSvcCodeOcean,
  IconSvcColab,
  IconSvcHuggingFace,
  IconSvcJupyter,
  IconSvcMyBinder,
  IconSvcOpenReview,
  IconSvcReplicateAi,
  IconSvcResearchHub,
  IconSvcYoutube,
  IconTwitter,
} from "@src/icons";

export const ServiceIconWrapper = ({
  Icon,
  className,
  wrapperClassName,
  ...rest
}: IconWrapperProps) => (
  <div
    className={`w-[30px] flex justify-center items-center overflow-hidden ${
      wrapperClassName ?? ""
    }`}
  >
    <Icon fill="white" width={24} height={24} className={className} {...rest} />
  </div>
);

interface CommonServiceObject {
  title: string;
  icon?: (props?: any) => JSX.Element;
}

export const commonServices: Record<string, CommonServiceObject> = {
  "colab.research.google.com": {
    icon: (props: any) => (
      <ServiceIconWrapper Icon={IconSvcColab} className="p-[1px]" {...props} />
    ),
    title: "Colab",
  },
  "codeocean.com": {
    icon: (props: any) => (
      <ServiceIconWrapper
        Icon={IconSvcCodeOcean}
        className="p-[1px]"
        {...props}
      />
    ),
    title: "CodeOcean",
  },
  "mybinder.org": {
    icon: (props: any) => (
      <ServiceIconWrapper
        Icon={IconSvcMyBinder}
        className="p-[1px]"
        {...props}
      />
    ),
    title: "MyBinder",
  },
  "youtube.com": {
    icon: (props: any) => (
      <ServiceIconWrapper
        Icon={IconSvcYoutube}
        className="p-[1px]"
        {...props}
      />
    ),
    title: "YouTube",
  },
  "twitter.com": {
    icon: (props: any) => (
      <ServiceIconWrapper Icon={IconTwitter} className="p-[1px]" {...props} />
    ),
    title: "Twitter",
  },
  "openreview.net": {
    icon: (props: any) => (
      <ServiceIconWrapper
        Icon={IconSvcOpenReview}
        className="p-[1px]"
        {...props}
      />
    ),
    title: "OpenReview",
  },
  "researchhub.com": {
    icon: (props: any) => (
      <ServiceIconWrapper
        Icon={IconSvcResearchHub}
        className="p-[1px]"
        {...props}
      />
    ),
    title: "ResearchHub",
  },
  "huggingface.co": {
    icon: (props: any) => (
      <ServiceIconWrapper
        Icon={IconSvcHuggingFace}
        className="p-[1px]"
        {...props}
      />
    ),
    title: "Hugging Face",
  },
  "replicate.ai": {
    icon: (props: any) => (
      <ServiceIconWrapper
        Icon={IconSvcReplicateAi}
        className="p-[1px]"
        {...props}
      />
    ),
    title: "Replicate",
  },
  "jupyter.org": {
    icon: (props: any) => (
      <ServiceIconWrapper
        Icon={IconSvcJupyter}
        className="p-[1px]"
        {...props}
      />
    ),
    title: "Jupyter",
  },
};

// Extract service from url
const getServiceFromUrl = (url: string): CommonServiceObject => {
  try {
    // Format the url to ensure it can be passed into URL constructor
    if (!url.match(/^(http|https):\/\//i)) {
      url = "http://" + url;
    }
    const urlObject = new URL(url);

    // Remove 'www.' from the hostname if it's present
    const domain = urlObject.hostname.startsWith("www.")
      ? urlObject.hostname.slice(4)
      : urlObject.hostname;

    const matchedService = commonServices[domain];

    if (matchedService) {
      return matchedService;
    }

    // Extract SLD and capitalize it if no matches
    const sld = domain.split(".")[0];
    const capitalizedSLD = sld.charAt(0).toUpperCase() + sld.slice(1);

    return { title: capitalizedSLD };
  } catch {
    return { title: "Unknown" };
  }
};

const ExternalService = ({ url }: { url: string }) => {
  const service = getServiceFromUrl(url);

  return (
    <div className="flex items-center gap-1">
      <div className="w-[30px]">{service.icon && service.icon()}</div>
      <span>{service.title}</span>
    </div>
  );
};

export default ExternalService;
