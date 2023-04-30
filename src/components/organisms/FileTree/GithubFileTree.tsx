import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useNodeReader } from "@src/state/nodes/hooks";
import axios from "axios";
import { useEffect, useState } from "react";
import FileTree from ".";

interface GithubFileTreeProps {
  owner: string;
  repo: string;
  branch: string;
}

const addToTreeRecursively = (
  children: any[],
  path: string[],
  type: string,
  sha: string,
  url?: string
): any => {
  if (path.length === 1) {
    if (type === "tree") {
      children.push({
        name: path[0],
        type: "folder",
        sha,
        children: [],
      });
    } else {
      children.push({
        name: path[0],
        type: "file",
        sha,
        url,
      });
    }
  } else {
    let folder = children.find((obj: any) => obj.name === path[0]);
    addToTreeRecursively(folder.children, path.slice(1), type, sha, url);
  }
};

const GithubFileTree = (props: GithubFileTreeProps) => {
  const { owner, repo, branch } = props;
  const [data, setData] = useState<any>();
  const [error, setError] = useState(false);
  const { componentStack } = useNodeReader();

  useEffect(() => {
    setError(false);
    if (!owner || !repo || !branch) return;
    axios
      .get(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
      )
      .then((resp: any) => {
        setError(false);
        const treeData = resp?.data?.tree;

        // did this to make sure folders were added first so that folders always appear on top of files
        const folderData = [];
        const fileData = [];
        for (let item of treeData) {
          if (item.type === "tree") {
            folderData.push(item);
          } else {
            fileData.push(item);
          }
        }

        const fileStructure = {
          name: repo,
          isOpen: true,
          type: "folder",
          children: [],
        };

        for (let item of folderData) {
          addToTreeRecursively(
            fileStructure.children,
            item.path.split("/"),
            item.type,
            item.sha
          );
        }
        for (let item of fileData) {
          addToTreeRecursively(
            fileStructure.children,
            item.path.split("/"),
            item.type,
            item.sha,
            item.url
          );
        }

        setData(fileStructure);
      })
      .catch((e) => {
        setTimeout(() => {
          setError(true);
        });
      });
    return () => {
      setData({});
    };
  }, [owner, repo, branch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(false);
      }, 10000);
    }
  }, [error]);

  return data ? (
    <>
      {error &&
      componentStack.length &&
      componentStack[componentStack.length - 1].type == "code" ? (
        <div
          className="fixed bg-red-800 w-screen h-8 text-xs text-center p-2 text-gray-200 pt-100"
          style={{ zIndex: 101, left: 0, bottom: 0 }}
        >
          <b>[Code View]</b> Rate limit error, please try again
        </div>
      ) : null}
      <FileTree data={data} />
    </>
  ) : null;
};

export default GithubFileTree;
