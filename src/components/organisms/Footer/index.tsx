export default function Footer() {
  const navigation = {
    // solutions: [
    //   { name: "Research", href: "https://mirror.xyz/descifoundation.eth/MejiI_proEoelPawGjwEBL7AdO4Do6O9MJ4zs3C0DV0" },
    //   { name: "Open Peer Review", href: "/" },
    //   { name: "Featured Research", href: "/" },
    //   { name: "Open Science", href: "/" },
    // ],
    support: [
      {
        name: "Video for New Users",
        href: "https://www.youtube.com/watch?v=rdrSwMFdJWY&t=560s",
        external: true,
      },
      {
        name: "Guides",
        href: "https://docs.desci.com/using-nodes/getting-started",
        external: true,
      },
      {
        name: "Documentation",
        href: "https://docs.desci.com/",
        external: true,
      },
      // { name: "API Status", href: "/" },
    ],
    company: [
      { name: "DeSci Nodes", href: "https://desci.com/nodes", external: true },
      { name: "DeSci Labs", href: "https://desci.com", external: true },
      {
        name: "DeSci Foundation",
        href: "https://descifoundation.org",
        external: true,
      },
    ],
    legal: [
      { name: "Claim", href: "https://desci.com/contact", external: true },
      { name: "Privacy", href: "https://desci.com/privacy", external: true },
      { name: "Terms", href: "/terms", external: true },
    ],
    social: [
      {
        name: "Discord",
        href: "https://discord.gg/A5P9fgB5Cf",
        icon: (props: any) => (
          <svg
            width="24"
            height="24"
            viewBox="0 0 71 55"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
          >
            <g clipPath="url(#clip0)">
              <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" />
            </g>
            <defs>
              <clipPath id="clip0">
                <rect width="71" height="55" fill="white" />
              </clipPath>
            </defs>
          </svg>
        ),
      },
      {
        name: "GitHub",
        href: "https://github.com/desci-labs",
        icon: (props: any) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        name: "Twitter",
        href: "https://twitter.com/DeSciLabs",
        icon: (props: any) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
        ),
      },
    ],
  };

  const linkClass = "text-base text-white hover:text-gray-400";
  return (
    <footer
      style={{ zIndex: 1, position: "relative" }}
      className="bg-black"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            {/* <img
              className="h-48 mx-auto"
              src={Logo}
              style={{
                filter:
                  "invert(1) sepia(0.6) invert(1) hue-rotate(13deg) saturate(5) opacity(0.6)",
              }}
              alt="DeSci Labs"
            /> */}
            <div className="text-gray-500 text-base dark:text-gray-400">
              <svg
                width="140"
                height="46"
                viewBox="0 0 140 46"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.1269 9.57068C16.8769 9.58978 18.6267 9.60779 20.3763 9.62472H20.3995H20.4343C20.5193 9.62472 20.6031 9.62472 20.6649 9.71849C21.1753 10.4908 21.6894 11.2617 22.2371 12.0861C21.4639 12.0484 20.7403 12.0158 20.0187 11.978C19.4936 11.95 18.9691 11.9129 18.4439 11.883C18.3589 11.8777 18.2506 11.8615 18.2146 11.9533C18.172 12.0627 18.3009 12.0835 18.3582 12.1304C19.8202 13.3631 20.9156 14.8386 21.3589 16.7458C21.5657 17.6366 21.5296 18.5359 21.395 19.4299C21.3827 19.5081 21.3692 19.5869 21.355 19.6637L27.7771 21.778L28.2461 21.933L28.5 22.0164L14.5464 46L0.5 22.0151L7.8241 19.6188C7.82064 19.5996 7.81612 19.5807 7.81057 19.5621C7.34407 16.6579 7.69201 13.951 9.78866 11.7195C11.23 10.1841 13.0561 9.54854 15.1269 9.57068ZM14.2925 28.3125L1.06314 22.3335L14.4156 45.1047M21.3035 20.0596C20.6437 22.6512 18.5425 25.0618 15.1914 25.2494C14.345 25.3051 13.495 25.2393 12.6669 25.054C10.154 24.468 8.46714 22.2925 7.91946 20.0017L1.26804 22.1004L14.4813 27.8469L22.587 24.371L27.9272 22.1642M14.5457 17.8372L10.6276 19.1187C10.9601 20.5786 11.6063 21.9988 12.739 23.0009C14.0464 24.1554 15.5006 24.0877 16.7165 22.8342C17.683 21.8379 18.1985 20.4764 18.4884 19.1356L14.5457 17.8372ZM12.768 12.5875C12.2721 13.0041 11.8506 13.5036 11.5219 14.0644C10.672 15.506 10.288 17.0525 10.518 18.7332V18.7371L14.5464 17.4204L18.5702 18.7456C18.5767 18.6844 18.5825 18.6316 18.5883 18.5938C18.6875 17.931 18.636 17.2746 18.5135 16.6215C18.2423 15.1752 17.683 13.8736 16.6521 12.8024C15.5561 11.6655 13.9691 11.5789 12.768 12.5875ZM14.7223 0.142485C15.8726 1.86763 17.6817 4.56931 20.1495 8.24751C19.3028 7.81731 18.5569 7.43898 17.9117 7.11253L17.8177 7.06695C17.0741 6.69145 16.4691 6.38757 16.0026 6.15533C15.6089 5.95998 15.2107 5.76788 14.828 5.54974C14.6463 5.44621 14.5103 5.45467 14.326 5.54519C13.1366 6.12559 11.2872 7.02636 8.77771 8.24751L12.5206 2.86825L13.2764 1.78407C13.654 1.24143 14.0307 0.698795 14.4066 0.156159C14.5193 -0.00988756 14.5709 -0.0847713 14.7223 0.142485Z"
                  fill="white"
                />
                <path
                  d="M43.6182 15.7029C44.6698 15.7029 45.6 15.8512 46.4089 16.1478C47.2313 16.4309 47.9188 16.8623 48.4716 17.442C49.0378 18.0217 49.4692 18.743 49.7658 19.6058C50.0624 20.4551 50.2107 21.446 50.2107 22.5784C50.2107 24.1962 49.9276 25.5579 49.3613 26.6633C48.7951 27.7553 47.9862 28.5844 46.9347 29.1507C45.8831 29.7169 44.6293 30 43.1733 30H37.1067V28.2609L38.9267 27.6542L38.4616 28.3216V17.4622L38.9469 18.17L37.1067 17.5431V15.804L42.0813 15.7029H43.6182ZM43.3351 27.4924C43.6856 27.4924 44.0429 27.452 44.4069 27.3711C44.7709 27.2767 45.1079 27.0813 45.418 26.7847C45.7281 26.4746 45.9775 26.0027 46.1662 25.3691C46.355 24.7355 46.4493 23.8727 46.4493 22.7807C46.4493 21.7291 46.355 20.8933 46.1662 20.2731C45.991 19.653 45.755 19.2013 45.4584 18.9182C45.1753 18.6216 44.8653 18.4329 44.5282 18.352C44.1912 18.2576 43.8609 18.2104 43.5373 18.2104H41.4544L41.9802 17.6847V28.0182L41.4544 27.4924H43.3351ZM56.3584 30.2629C55.3473 30.2629 54.4575 30.0607 53.689 29.6562C52.9206 29.2383 52.3274 28.6249 51.9095 27.816C51.4916 26.9936 51.2826 25.9825 51.2826 24.7827C51.2826 23.5424 51.505 22.4841 51.9499 21.6078C52.3948 20.7315 53.0285 20.0574 53.8508 19.5856C54.6732 19.1137 55.6506 18.8778 56.783 18.8778C57.875 18.8778 58.7648 19.0867 59.4524 19.5047C60.1399 19.9226 60.6387 20.5023 60.9488 21.2438C61.2724 21.9718 61.4342 22.7941 61.4342 23.7109C61.4342 23.967 61.4207 24.2299 61.3937 24.4996C61.3802 24.7692 61.3398 25.0456 61.2724 25.3287H54.0935V23.448H58.3806L57.8953 23.7918C57.9087 23.266 57.875 22.8211 57.7942 22.4571C57.7133 22.0796 57.565 21.7965 57.3493 21.6078C57.147 21.4056 56.8639 21.3044 56.4999 21.3044C56.055 21.3044 55.7113 21.446 55.4686 21.7291C55.2259 21.9987 55.0507 22.356 54.9428 22.8009C54.8485 23.2458 54.8013 23.7311 54.8013 24.2569C54.8013 24.904 54.8687 25.4904 55.0035 26.0162C55.1383 26.542 55.381 26.9667 55.7315 27.2902C56.082 27.6003 56.5673 27.7553 57.1875 27.7553C57.6054 27.7553 58.0638 27.6812 58.5626 27.5329C59.0749 27.3711 59.6074 27.1419 60.1602 26.8453L61.2926 28.6249C60.4837 29.1776 59.6613 29.5888 58.8255 29.8584C57.9896 30.1281 57.1673 30.2629 56.3584 30.2629ZM66.2633 19.3429C66.2633 19.6799 66.3914 19.963 66.6475 20.1922C66.9037 20.4214 67.2407 20.6236 67.6587 20.7989C68.0901 20.9607 68.5619 21.1224 69.0742 21.2842C69.6 21.446 70.1123 21.6415 70.6111 21.8707C71.1234 22.0864 71.5885 22.3627 72.0064 22.6998C72.4378 23.0233 72.7816 23.4345 73.0378 23.9333C73.3074 24.4321 73.4422 25.0388 73.4422 25.7533C73.4422 26.8049 73.1726 27.6677 72.6333 28.3418C72.0941 29.0024 71.3728 29.4944 70.4695 29.818C69.5663 30.1281 68.5754 30.2831 67.4969 30.2831C66.7554 30.2831 65.9937 30.209 65.2118 30.0607C64.4298 29.9259 63.6614 29.7169 62.9064 29.4338L63.0278 25.3489H65.0298L65.5151 27.7351L65.1915 27.1891C65.569 27.3644 65.9735 27.4992 66.4049 27.5936C66.8363 27.6879 67.2542 27.7351 67.6587 27.7351C68.0901 27.7351 68.481 27.6812 68.8315 27.5733C69.1821 27.452 69.4652 27.2835 69.6809 27.0678C69.8966 26.8386 70.0044 26.5555 70.0044 26.2184C70.0044 25.841 69.8764 25.5376 69.6202 25.3084C69.3641 25.0658 69.0203 24.8636 68.5889 24.7018C68.1709 24.5265 67.7058 24.3647 67.1935 24.2164C66.6812 24.0681 66.1689 23.8929 65.6567 23.6907C65.1578 23.475 64.6927 23.2053 64.2613 22.8818C63.8434 22.5582 63.5064 22.1538 63.2502 21.6684C62.9941 21.1696 62.866 20.5495 62.866 19.808C62.866 18.8104 63.1019 17.9947 63.5738 17.3611C64.0456 16.714 64.686 16.2354 65.4949 15.9253C66.3172 15.6018 67.2407 15.44 68.2653 15.44C68.9798 15.44 69.7348 15.5141 70.5302 15.6624C71.3391 15.8107 72.1345 16.0332 72.9164 16.3298L72.694 20.0911H70.6111L70.1258 17.988L70.4898 18.3318C70.1797 18.2239 69.8494 18.143 69.4989 18.0891C69.1618 18.0217 68.8181 17.988 68.4675 17.988C68.0766 17.988 67.7126 18.0352 67.3755 18.1296C67.0385 18.2104 66.7689 18.352 66.5667 18.5542C66.3644 18.7564 66.2633 19.0193 66.2633 19.3429ZM79.5621 30.2629C78.6049 30.2629 77.7354 30.0472 76.9534 29.6158C76.185 29.1709 75.5783 28.5305 75.1334 27.6947C74.6886 26.8588 74.4661 25.841 74.4661 24.6411C74.4661 23.5356 74.6279 22.6189 74.9514 21.8909C75.2885 21.1494 75.7266 20.5562 76.2659 20.1113C76.8186 19.6664 77.4253 19.3496 78.0859 19.1609C78.76 18.9721 79.4408 18.8778 80.1283 18.8778C80.8429 18.8778 81.5372 18.9654 82.2112 19.1407C82.8988 19.3024 83.438 19.471 83.829 19.6462L83.7481 22.8211H81.5843L81.2608 21.2842L81.5237 21.4662C81.3754 21.4123 81.1799 21.3719 80.9372 21.3449C80.6946 21.3044 80.4586 21.2842 80.2294 21.2842C79.7037 21.2842 79.279 21.419 78.9554 21.6887C78.6319 21.9448 78.396 22.3088 78.2477 22.7807C78.1129 23.2525 78.0454 23.812 78.0454 24.4591C78.0454 25.1871 78.1398 25.8005 78.3286 26.2993C78.5173 26.7847 78.7869 27.1487 79.1374 27.3913C79.488 27.634 79.8924 27.7553 80.3508 27.7553C80.7552 27.7553 81.1866 27.6744 81.645 27.5127C82.1169 27.3509 82.6224 27.1082 83.1617 26.7847L84.2739 28.5238C83.5054 29.117 82.7235 29.5551 81.9281 29.8382C81.1462 30.1213 80.3575 30.2629 79.5621 30.2629ZM89.4677 28.0384L89.2452 27.7553L90.7012 28.2609V30H84.7963V28.2609L86.2523 27.7553L86.0299 28.0384V21.2236L86.2321 21.4258L84.7963 20.9404V19.2216L89.4677 19.0598V28.0384ZM87.6881 17.7858C87.1084 17.7858 86.6366 17.624 86.2726 17.3004C85.9221 16.9634 85.7468 16.4848 85.7468 15.8647C85.7468 15.2176 85.9288 14.739 86.2928 14.4289C86.6703 14.1053 87.1421 13.9436 87.7084 13.9436C88.2611 13.9436 88.7195 14.0986 89.0835 14.4087C89.4475 14.7187 89.6295 15.2041 89.6295 15.8647C89.6295 16.4983 89.4407 16.9769 89.0632 17.3004C88.6992 17.624 88.2409 17.7858 87.6881 17.7858ZM103.28 25.3893H105.343V30H94.9691V28.2609L96.7082 27.6744L96.324 28.3216V17.4622L96.7082 18.1093L94.9691 17.5431V15.804L101.299 15.7029V17.442L99.4989 18.1093L99.8426 17.4622V28.0182L99.3169 27.4924H103.24L102.775 28.0384L103.28 25.3893ZM115.75 28.3013L115.285 27.6138L116.983 28.2609V30L113.06 30.182L112.636 28.2609L112.838 28.3216C112.352 28.9687 111.8 29.454 111.18 29.7776C110.573 30.1011 109.926 30.2629 109.238 30.2629C108.308 30.2629 107.553 29.973 106.973 29.3933C106.407 28.8001 106.124 27.9913 106.124 26.9667C106.124 26.2117 106.286 25.605 106.609 25.1467C106.946 24.6748 107.438 24.331 108.086 24.1153C108.733 23.8996 109.542 23.7918 110.512 23.7918H112.494L112.312 23.994V22.9627C112.312 22.3964 112.177 21.992 111.908 21.7493C111.651 21.4932 111.254 21.3651 110.714 21.3651C110.472 21.3651 110.202 21.3853 109.906 21.4258C109.622 21.4662 109.319 21.5336 108.996 21.628L109.299 21.2842L108.996 22.8413H106.892L106.731 19.6664C107.715 19.3968 108.611 19.2013 109.42 19.08C110.243 18.9452 110.991 18.8778 111.665 18.8778C113.013 18.8778 114.031 19.1609 114.718 19.7271C115.406 20.2799 115.75 21.1494 115.75 22.3358V28.3013ZM109.562 26.5824C109.562 27.0139 109.663 27.3374 109.865 27.5531C110.067 27.7553 110.323 27.8564 110.634 27.8564C110.917 27.8564 111.213 27.7756 111.523 27.6138C111.847 27.452 112.15 27.2228 112.433 26.9262L112.312 27.3913V25.2276L112.514 25.45H111.078C110.512 25.45 110.115 25.5376 109.885 25.7129C109.67 25.8881 109.562 26.178 109.562 26.5824ZM122.167 30.2629C121.601 30.2629 121.001 30.2292 120.368 30.1618C119.734 30.1079 119.047 30.0135 118.305 29.8787V15.804L118.831 16.6938L117.071 16.1073V14.3884L121.743 14.1862V20.8798L121.318 20.3742C121.79 19.9159 122.309 19.5519 122.875 19.2822C123.441 19.0126 124.048 18.8778 124.695 18.8778C125.491 18.8778 126.185 19.0867 126.778 19.5047C127.371 19.9091 127.836 20.5158 128.173 21.3247C128.511 22.1336 128.679 23.1379 128.679 24.3378C128.679 25.1601 128.578 25.9353 128.376 26.6633C128.173 27.3779 127.83 28.0047 127.344 28.544C126.873 29.0833 126.212 29.5079 125.363 29.818C124.513 30.1146 123.448 30.2629 122.167 30.2629ZM122.774 27.8564C123.623 27.8564 124.223 27.5666 124.574 26.9869C124.938 26.4072 125.12 25.6185 125.12 24.6209C125.12 23.9603 125.046 23.3873 124.897 22.902C124.763 22.4167 124.567 22.0392 124.311 21.7696C124.055 21.4999 123.731 21.3651 123.34 21.3651C123.03 21.3651 122.713 21.4527 122.39 21.628C122.066 21.7898 121.716 22.0324 121.338 22.356L121.743 21.3449V28.4429L121.338 27.6542C121.891 27.789 122.37 27.8564 122.774 27.8564ZM133.284 21.9516C133.284 22.2212 133.419 22.4369 133.689 22.5987C133.958 22.7604 134.302 22.902 134.72 23.0233C135.151 23.1447 135.61 23.2795 136.095 23.4278C136.58 23.5761 137.032 23.7716 137.45 24.0142C137.881 24.2434 138.232 24.5535 138.502 24.9444C138.771 25.3354 138.906 25.841 138.906 26.4611C138.906 27.3374 138.67 28.0587 138.198 28.6249C137.74 29.1776 137.113 29.5956 136.318 29.8787C135.536 30.1483 134.653 30.2831 133.668 30.2831C133.075 30.2831 132.455 30.2292 131.808 30.1213C131.161 30.027 130.5 29.8921 129.826 29.7169L129.968 26.5218H132.091L132.354 28.2204L132.071 27.7553C132.327 27.8497 132.61 27.9171 132.92 27.9576C133.23 27.998 133.5 28.0182 133.729 28.0182C134.012 28.0182 134.289 27.9913 134.558 27.9373C134.828 27.8699 135.044 27.7688 135.205 27.634C135.367 27.4992 135.448 27.3239 135.448 27.1082C135.448 26.8251 135.313 26.6027 135.044 26.4409C134.787 26.2791 134.444 26.1376 134.012 26.0162C133.594 25.8949 133.149 25.7668 132.678 25.632C132.206 25.4837 131.754 25.2882 131.323 25.0456C130.905 24.7894 130.561 24.4524 130.291 24.0344C130.035 23.6165 129.907 23.0705 129.907 22.3964C129.907 21.5606 130.109 20.8865 130.514 20.3742C130.918 19.8484 131.471 19.4642 132.172 19.2216C132.886 18.9789 133.675 18.8576 134.538 18.8576C135.145 18.8576 135.772 18.9115 136.419 19.0193C137.079 19.1137 137.76 19.2553 138.461 19.444L138.32 22.356H136.176L135.812 20.7989L136.277 21.2842C135.67 21.1494 135.145 21.082 134.7 21.082C134.282 21.082 133.938 21.1561 133.668 21.3044C133.412 21.4527 133.284 21.6684 133.284 21.9516Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-black hover:text-gray-800 bg-primary bg-opacity-100 rounded-full block p-1.5"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
            <div className="text-sm text-white font-bold">
              &copy; {new Date().getFullYear()} DeSci Labs Ltd. All rights
              reserved.
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Science
                </h3>
                <ul className="mt-4 space-y-4 list-none">
                  {navigation.solutions.map((item) => (
                    <li key={item.name}>
                      <a href={item.href} className={linkClass}>
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div> */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4 list-none">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={linkClass}
                        target={item.external ? "_blank" : ""}
                        rel="noreferrer"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  About
                </h3>
                <ul className="mt-4 space-y-4 list-none">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={linkClass}
                        target={item.external ? "_blank" : ""}
                        rel="noreferrer"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4 list-none">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={linkClass}
                        target={item.external ? "_blank" : ""}
                        rel="noreferrer"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
