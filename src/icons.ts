import React, { FC } from "react";
import { ReactComponent as IconAttributesOpenData } from "@images/icons/a-attributes-open-data.svg";
import { ReactComponent as IconAddComment } from "@images/icons/a-icon-add-comment.svg";
import { ReactComponent as IconRemoveComment } from "@images/icons/a-icon-remove-comment.svg";
import { ReactComponent as IconAttributesPreRegRepAnalysis } from "@images/icons/a-attributes-pre-reg-rep-analysis.svg";
import { ReactComponent as IconAttributesPreRegisteredReport } from "@images/icons/a-attributes-pre-registered-report.svg";
import { ReactComponent as IconEllipsis } from "@images/icons/a-icon-ellipsis.svg";
import { ReactComponent as IconAttributesTraceableHypothesis } from "@images/icons/a-attributes-traceable-hypothesis.svg";
import { ReactComponent as IconBadgeCodeData } from "@images/icons/a-badge-code-data.svg";
import { ReactComponent as IconBadgeDocker } from "@images/icons/a-badge-docker.svg";
import { ReactComponent as IconAddValidation } from "@images/icons/a-icon-add-validation.svg";
import { ReactComponent as IconCheckShield } from "@images/icons/a-icon-check-shield.svg";
import { ReactComponent as IconCheckShieldDark } from "@images/icons/check-shield-dark.svg";
import { ReactComponent as IconChevronDown } from "@images/icons/a-icon-chevron-down.svg";
import { ReactComponent as IconChevronUp } from "@images/icons/a-icon-chevron-up.svg";
import { ReactComponent as IconChevronLeft } from "@images/icons/a-icon-chevron-left.svg";
import { ReactComponent as IconCirclePlus } from "@images/icons/a-icon-circle-plus.svg";
import { ReactComponent as IconCircleCheck } from "@images/icons/a-icon-circle-check.svg";
import { ReactComponent as IconNodeNoMetadata } from "@images/icons/a-icon-node-no-metadata.svg";
import { ReactComponent as IconCircleX } from "@images/icons/a-icon-circle-x.svg";
import { ReactComponent as IconCode } from "@images/icons/a-icon-code.svg";
import { ReactComponent as IconCopyLink } from "@images/icons/a-icon-copy-link.svg";
import { ReactComponent as IconDarkMode } from "@images/icons/a-icon-dark-mode.svg";
import { ReactComponent as IconFigureComponent } from "@images/icons/a-icon-figure-component.svg";
// import IconDoi from "@images/icons/a-icon-doi@3x.png"; // TODO: Need SVG
import { ReactComponent as IconDoi } from "@images/icons/a-icon-doi.svg";
import IconAcm from "@images/icons/acm/acm-logo.png";
import { ReactComponent as IconDownload } from "@images/icons/a-icon-download.svg";
import { ReactComponent as IconDownloadPdf } from "@images/icons/g-icon-download.svg";
import { ReactComponent as IconDocument } from "@images/icons/a-icon-document.svg";
import { ReactComponent as IconEthereum } from "@images/icons/a-icon-ethereum.svg";
import { ReactComponent as IconFullWidth } from "@images/icons/a-icon-full-width.svg";
import { ReactComponent as IconHamburger } from "@images/icons/a-icon-hamburger.svg";
import { ReactComponent as IconHorizontalExpand } from "@images/icons/g-icon-horizontal-expand.svg";
import { ReactComponent as IconVerticalExpand } from "@images/icons/g-icon-vertical-expand.svg";
import { ReactComponent as IconInfo } from "@images/icons/a-icon-info.svg";
import { ReactComponent as IconIpfs } from "@images/icons/a-icon-ipfs.svg";
import { ReactComponent as IconMinus } from "@images/icons/a-icon-minus.svg";
import { ReactComponent as IconNetwork } from "@images/icons/a-icon-network.svg";
import { ReactComponent as IconOrcid } from "@images/icons/a-icon-orcid.svg";
import { ReactComponent as IconGitCoinPass } from "@images/icons/gcp-logo.svg";
import { ReactComponent as IconPlus } from "@images/icons/a-icon-plus.svg";
import { ReactComponent as IconAdd } from "@images/icons/e-add.svg";
import { ReactComponent as IconResearchObject } from "@images/icons/a-icon-research-object.svg";
import { ReactComponent as IconResearchObjectAlt } from "@images/icons/a-icon-research-object-alt.svg";
import { ReactComponent as IconTriangleLeft } from "@images/icons/a-icon-triangle-left.svg";
import { ReactComponent as IconTriangleRight } from "@images/icons/a-icon-triangle-right.svg";
import { ReactComponent as IconViewLink } from "@images/icons/a-icon-view-link.svg";
import { ReactComponent as IconPlay } from "@images/icons/a-icon-play.svg";
import { ReactComponent as IconX } from "@images/icons/a-icon-x.svg";
import { ReactComponent as IconOpenInNew } from "@images/icons/a-icon-open-in-new.svg";
import { ReactComponent as IconRemove } from "@images/icons/e-remove.svg";
import { ReactComponent as IconZoomInBase } from "@images/icons/g-icon-zoom-in.svg";
import { ReactComponent as IconZoomOutBase } from "@images/icons/g-icon-zoom-out.svg";
import { ReactComponent as IconMiniChevronDown } from "@images/icons/mini-chevron-down.svg";
import { ReactComponent as IconFish } from "@images/icons/fish.svg";
import { ReactComponent as IconConferenceKey } from "@images/icons/a-icon-conference-key.svg";
import { ReactComponent as IconOrganization } from "@images/icons/a-icon-organization.svg";
import { ReactComponent as IconProtocolLabs } from "@images/icons/a-icon-protocol-labs.svg";
import { ReactComponent as IconPcMonitor } from "@images/icons/a-icon-pc-monitor.svg";
import { ReactComponent as IconCopySquares } from "@images/icons/a-icon-copy-squares.svg";
import { ReactComponent as IconPen } from "@images/icons/a-icon-pen.svg";
import { ReactComponent as IconFishbone } from "@images/icons/fishbone.svg";
import { ReactComponent as IconDeleteForever } from "@images/icons/delete-forever.svg";
import { ReactComponent as IconCodeBracket } from "@images/icons/a-icon-code-bracket.svg";
import { ReactComponent as IconDataSquare } from "@images/icons/a-icon-data-square.svg";
import { ReactComponent as IconCodeDataEnv } from "@images/icons/a-icon-code-data-env.svg";
import { ReactComponent as IconEthereumCircle } from "@images/icons/a-ethereum-circle.svg";
import { ReactComponent as IconArcGrant } from "@images/icons/e-arc-grant.svg";
import { ReactComponent as IconFile } from "@images/icons/file.svg";
import { ReactComponent as IconFolder } from "@images/icons/folder.svg";
import { ReactComponent as IconOpenFolder } from "@images/icons/open-folder.svg";
import { ReactComponent as IconCreateFolder } from "@images/icons/create_new_folder.svg";
import { ReactComponent as IconShare } from "@images/icons/a-icon-ios-share.svg";
import { ReactComponent as IconDcite } from "@images/icons/dcite.svg";
import { ReactComponent as LogoMetamask } from "@images/metamask.svg";
import { ReactComponent as LogoTorus } from "@images/torus.svg";
import { ReactComponent as LogoWalletConnect } from "@images/walletconnect.svg";
import { ReactComponent as LogoCoinbase } from "@images/coinbase.svg";
import { ReactComponent as IconNodes } from "@images/icons/a-icon-nodes.svg";
import { ReactComponent as IconThreeDots } from "@images/icons/3dots.svg";
import { ReactComponent as IconLeftArrowThin } from "@images/icons/left-arrow-thin.svg";
import { ReactComponent as IconRightArrowThin } from "@images/icons/right-arrow-thin.svg";
import { ReactComponent as IconThreeDotsHoriz } from "@images/icons/a-icon-3dots-horiz.svg";
import { ReactComponent as IconExternalComponents } from "@images/icons/external-components.svg";
import { ReactComponent as IconComponentDocument } from "@images/icons/component-document.svg";
import { ReactComponent as IconComponentPreregisteredReport } from "@images/icons/component-preregistered-report.svg";
import { ReactComponent as IconComponentPreregisteredAnalysisPlan } from "@images/icons/component-preregistered-analysis-plan.svg";
import { ReactComponent as IconComponentSupplementaryInformation } from "@images/icons/component-supplementary-information.svg";
import { ReactComponent as IconComponentCode } from "@images/icons/component-code.svg";
import { ReactComponent as IconComponentPresentation } from "@images/icons/component-presentation.svg";
import { ReactComponent as IconComponentOpenData } from "@images/icons/component-open-data.svg";
import { ReactComponent as IconComponentDiscussions } from "@images/icons/component-discussions.svg";
import { ReactComponent as IconComponentExternalApi } from "@images/icons/component-external-api.svg";
import { ReactComponent as IconComponentRestrictedData } from "@images/icons/component-restricted-data.svg";
import { ReactComponent as IconComponentMisc } from "@images/icons/component-misc.svg";
import { ReactComponent as IconComponentUnknown } from "@images/icons/component-unknown.svg";
import { ReactComponent as IconLatex } from "@images/icons/a-icon-latex.svg";
import { ReactComponent as IconAuthor } from "@images/icons/a-icon-author.svg";
import { ReactComponent as IconNodeCollection } from "@images/icons/a-icon-node-collection.svg";
import { ReactComponent as IconDirectory } from "@images/icons/directory.svg";
import { ReactComponent as IconChevronRight } from "@images/icons/chevron-right.svg";
import { ReactComponent as IconRowTable } from "@images/icons/a-icon-row-table.svg";
import { ReactComponent as IconCPU } from "@images/icons/cpu-icon.svg";
import { ReactComponent as IconResearchNode } from "@images/icons/type-research-node-icon.svg";
import { ReactComponent as IconResearchReport } from "@images/icons/type-research-report-icon.svg";
import { ReactComponent as IconData } from "@images/icons/type-data-icon.svg";
import { ReactComponent as IconCodeRepo } from "@images/icons/type-code-repo-icon.svg";
import { ReactComponent as FormatBold } from "@images/icons/format-bold.svg";
import { ReactComponent as FormatItalic } from "@images/icons/format_italic.svg";
import { ReactComponent as FormatUnderlined } from "@images/icons/format_underlined.svg";
import { ReactComponent as FormatCode } from "@images/icons/format_code.svg";
import { ReactComponent as FormatQuote } from "@images/icons/format_quote.svg";
import { ReactComponent as FormatLink } from "@images/icons/link.svg";
import { ReactComponent as FormatHyperlink } from "@images/icons/format_hyperlink.svg";
import { ReactComponent as IconPenFancy } from "@images/icons/pen.svg";
import { ReactComponent as IconKey } from "@images/icons/key.svg";
import { ReactComponent as LatexLogo } from "@images/icons/latex-logo.svg";
import { ReactComponent as IconWallet } from "@images/icons/a-icon-wallet.svg";
import { ReactComponent as IconFolderStroke } from "@images/icons/folder-stroke.svg";
import { ReactComponent as IconGreenCheck } from "@images/icons/green-check.svg";
import { ReactComponent as IconWarning } from "@images/icons/warning.svg";
import { ReactComponent as IconPlanet } from "@images/planet.svg";
import { ReactComponent as IconBlock } from "@images/Block.svg";
import { ReactComponent as IconRepo } from "@images/repo.svg";
import { ReactComponent as IconDigitalKey } from "@images/digital-key.svg";
import { ReactComponent as IconDiscord } from "@images/discord.svg";
import { ReactComponent as IconTwitter } from "@images/twitter.svg";
import { ReactComponent as IconGithub } from "@images/github.svg";
import { ReactComponent as IconGitbook } from "@images/gitbook.svg";
import { ReactComponent as IconDesciNodes } from "@images/icons/a-desci-nodes-logo.svg";
import { ReactComponent as IconHelpBase } from "@images/icons/icon-help.svg";
import { ReactComponent as IconKebab } from "@images/icons/kebab.svg";
import { ReactComponent as IconStar } from "@images/icons/star.svg";
import { ReactComponent as IconQuotes } from "@images/icons/quotes.svg";
import { ReactComponent as IconPlayRounded } from "@images/icons/play.svg";
import { ReactComponent as IconAssignType } from "@images/icons/assign-type-icon.svg";
import { ReactComponent as IconDrive } from "@images/icons/drive.svg";

export type SvgIconProps = FC<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;

const IconHelp = React.memo(IconHelpBase);
const IconZoomIn = React.memo(IconZoomInBase);
const IconZoomOut = React.memo(IconZoomOutBase);

export {
  IconDrive,
  IconAssignType,
  IconPlayRounded,
  IconQuotes,
  IconStar,
  IconKebab,
  IconHelp,
  IconDesciNodes,
  IconWarning,
  IconGreenCheck,
  IconFolderStroke,
  IconWallet,
  IconCodeRepo,
  IconResearchNode,
  IconResearchReport,
  IconData,
  IconCPU,
  IconRowTable,
  IconNodeCollection,
  IconAuthor,
  IconLatex,
  IconDirectory,
  IconComponentUnknown,
  IconComponentMisc,
  IconComponentRestrictedData,
  IconComponentExternalApi,
  IconComponentDiscussions,
  IconComponentOpenData,
  IconComponentPresentation,
  IconComponentCode,
  IconComponentSupplementaryInformation,
  IconComponentPreregisteredAnalysisPlan,
  IconComponentPreregisteredReport,
  IconComponentDocument,
  IconExternalComponents,
  IconThreeDotsHoriz,
  IconThreeDots,
  IconLeftArrowThin,
  IconRightArrowThin,
  IconNodes,
  LogoCoinbase,
  LogoWalletConnect,
  LogoMetamask,
  LogoTorus,
  IconDcite,
  IconShare,
  IconArcGrant,
  IconEthereumCircle,
  IconCodeDataEnv,
  IconFishbone,
  IconDataSquare,
  IconConferenceKey,
  IconCheckShieldDark,
  IconProtocolLabs,
  IconOrganization,
  IconFish,
  IconAttributesOpenData,
  IconAttributesPreRegRepAnalysis,
  IconAttributesPreRegisteredReport,
  IconAttributesTraceableHypothesis,
  IconBadgeCodeData,
  IconBadgeDocker,
  IconAddValidation,
  IconCheckShield,
  IconAddComment,
  IconRemoveComment,
  IconChevronDown,
  IconChevronUp,
  IconChevronLeft,
  IconChevronRight,
  IconCirclePlus,
  IconCircleCheck,
  IconCircleX,
  IconNodeNoMetadata,
  IconEllipsis,
  IconCode,
  IconCopyLink,
  IconDarkMode,
  IconDoi,
  IconAcm,
  IconDownload,
  IconDownloadPdf,
  IconDocument,
  IconEthereum,
  IconFullWidth,
  IconHamburger,
  IconHorizontalExpand,
  IconVerticalExpand,
  IconFigureComponent,
  IconCodeBracket,
  IconInfo,
  IconIpfs,
  IconMinus,
  IconMiniChevronDown,
  IconNetwork,
  IconOrcid,
  IconPlus,
  IconGitCoinPass,
  IconAdd,
  IconResearchObject,
  IconResearchObjectAlt,
  IconTriangleLeft,
  IconTriangleRight,
  IconViewLink,
  IconPlay,
  IconX,
  IconOpenInNew,
  IconRemove,
  IconZoomIn,
  IconZoomOut,
  IconPcMonitor,
  IconCopySquares,
  IconPen,
  IconDeleteForever,
  IconFile,
  IconFolder,
  IconOpenFolder,
  IconCreateFolder,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatCode,
  FormatQuote,
  FormatLink,
  FormatHyperlink,
  IconPenFancy,
  IconKey,
  LatexLogo,
  IconPlanet,
  IconBlock,
  IconRepo,
  IconDigitalKey,
  IconDiscord,
  IconTwitter,
  IconGithub,
  IconGitbook,
};
