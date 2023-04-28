import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useEffectOnce, useList } from "react-use";
import { concatMap, from, Observable } from "rxjs";
import { IconX } from "@icons";
import { EMPTY_FUNC } from "@components/utils";
import { ResearchObjectComponentType, TerminalComponent } from "@desci-labs/desci-models";

const BORDER_COLOR = "rgb(178,178,178)";

const TabWrapper = styled.div.attrs({
  className: `h-8 flex flex-row items-end b-[1px]`,
})`
  &::after {
    content: "";
    flex: 1;
  }
`;
const Tab = styled.div.attrs({
  className:
    "cursor-pointer hover:dark:bg-dark-gray px-2 text-xs bg-white dark:bg-zinc-900 border-[1px] dark:text-gray-400 border-t-[2px]  dark:border-x-gray-400 border-t-teal border-b-[2px] border-b-gray-900 -mb-[1px] z-10 relative",
})`
  height: 90%;
  border-bottom-width: 0;

  border-top-right-radius: 2px;
  border-top-left-radius: 2px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
const WindowWrapper = styled.div.attrs({
  className:
    "p-0 border-[1px] dark:border-t-gray-400 w-full rounded-b-lg overflow-hidden -mt-[1px]",
})`
  height: calc(100% - 32px);
  border-color: ${BORDER_COLOR};
`;

interface TerminalProps {
  onRequestClose?: () => void;
}

const Terminal = (props: TerminalProps) => {
  const { onRequestClose = EMPTY_FUNC } = props;
  const [logsToDisplay, { push: pushToLogsToDisplay }] = useList<string>([]);
  const scrollRef = useRef<any>();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: Infinity }); // scroll to bottom
    }
  }, [logsToDisplay]);

  useEffectOnce(() => {
    const logs = REPRODUCIBLE_RUN_SAMPLE_DATA.payload.logs
      .trim()
      .split(`\n`) // trim and split into arr by new line
      .map((str: string) => str.trim()); // trim again

    const subscription = from(logs)
      .pipe(
        concatMap((log: string) => {
          return new Observable((subscriber: any) => {
            setTimeout(() => {
              subscriber.next(log);
              subscriber.complete();
            }, randn_bm(0, 20000, 7)); // Box–Muller transform with skew
          });
        })
      )
      .subscribe((log: any) => {
        pushToLogsToDisplay(log);
      });
    return () => subscription.unsubscribe();
  });

  const [tabs, setTabs] = useState<any>([
    {
      key: "Run 857579",
      component: (logsToDisplay: any) => (
        <>
          {logsToDisplay.map((log: string, index: number) => (
            <p key={`log_${index}`} className="w-full text-xs">
              {log}
            </p>
          ))}
        </>
      ),
    },
  ]);
  useEffect(() => {
    setTimeout(() => {
      setTabs([
        ...tabs,
        {
          key: "Result",
          component: () => (
            <>
              <img
                src={
                  "https://ipfs.desci.com/ipfs/QmdeSZfJ7ywPFnCUCF8VCNbWAFNfJit6uJYRWrUBswepkw"
                }
              />
            </>
          ),
        },
      ]);
      setSelectedTab(1);
    }, 15000);
  }, []);
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1/2">
      <div className="w-full h-full pr-3 pb-2 bg-transparent  flex flex-col">
        <TabWrapper>
          {tabs.map((t: any, i: number) => (
            <Tab
              key={t.key}
              style={{
                fontStyle: selectedTab == i ? "" : "italic",
                // borderRightColor:
                //   selectedTab == i + 1 && i < tabs.length - 1 ? "black" : undefined,
                // borderLeftColor:
                //   selectedTab == i - 1 && i > 0 ? "black" : undefined,
              }}
            >
              <span onClick={() => setSelectedTab(i)}>{t.key}</span>
              <IconX
                width={24}
                height={24}
                className="pl-3 cursor-pointer dark:fill-white"
                onClick={() => {
                  const t2 = Array.from(tabs);
                  t2.splice(i, 1);
                  setTabs(t2);
                  setTimeout(() => {
                    setSelectedTab(0);
                  }, 100);

                  if (t2.length == 0) {
                    onRequestClose && onRequestClose();
                  }
                }}
              />
            </Tab>
          ))}
        </TabWrapper>
        <WindowWrapper>
          <div
            ref={scrollRef}
            className=" h-full overflow-y-scroll overscroll-x-contain flex flex-col-reverse bg-white dark:bg-zinc-900 dark:text-zinc-500 py-2"
          >
            <div className="w-full h-fit px-2">
              {tabs[selectedTab] && tabs[selectedTab].component &&
                tabs[selectedTab].component(logsToDisplay)}
            </div>
          </div>
        </WindowWrapper>
      </div>
    </div>
  );
};

export default Terminal;

// used to calc random times between log lines
function randn_bm(min: number, max: number, skew: number) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0)
    num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
  else {
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  return num;
}

const REPRODUCIBLE_RUN_SAMPLE_DATA: TerminalComponent = {
  id: "oiaosidfasdf",
  name: "Terminal",
  type: ResearchObjectComponentType.TERMINAL,
  payload: {
    logs: `
    2021-03-05T05:46:31.296 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 55005916
2021-03-05T05:46:31.296 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 44286599
2021-03-05T05:46:31.296 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 128795429
2021-03-05T05:46:31.297 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 120850541
2021-03-05T05:46:31.297 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 35470004
2021-03-05T05:46:31.298 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 96664777
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 63143936-63144448 for 63144211
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 88801792-88802304 for 88801901
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 108494848-108495360 for 108495240
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 22749696-22750208 for 22749959
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 14698496-14699008 for 14698963
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 98592768-98593280 for 98593246
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 7117824-7118336 for 7118271
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 101633024-101633536 for 101633070
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 5264896-5265408 for 5265230
2021-03-05T05:46:31.299 DEBUG merkletree::merkle > leafs 134217728, branches 8, total size 153391689, total row_count 10, cache_size 299593, rows_to_discard 2, partial_row_count 4, cached_leafs 262144, segment_width 512, segment range 121800192-121800704 for 121800669
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 14698963
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 22749959
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 5265230
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 7118271
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 88801901
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 101633070
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 98593246
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 63144211
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 121800669
2021-03-05T05:46:31.301 DEBUG merkletree::merkle > generated partial_tree of row_count 4 and len 585 with 8 branches for proof at 108495240
2021-03-05T05:46:31.325 INFO storage_proofs_core::compound_proof > vanilla_proofs:finish
2021-03-05T05:46:31.731 INFO storage_proofs_core::compound_proof > snark_proof:start
2021-03-05T05:46:31.856 INFO bellperson::groth16::prover > Bellperson 0.12.5 is being used!
2021-03-05T05:46:56.860 INFO bellperson::groth16::prover > starting proof timer
2021-03-05T05:46:59.156 DEBUG bellperson::gpu::locks > Acquiring priority lock at "/data/tmpdir/bellman.priority.lock" ...
2021-03-05T05:46:59.156 DEBUG bellperson::gpu::locks > Priority lock acquired!
2021-03-05T05:46:59.372 INFO bellperson::gpu::locks > GPU is available for FFT!
2021-03-05T05:46:59.372 DEBUG bellperson::gpu::locks > Acquiring GPU lock at "/data/tmpdir/bellman.gpu.lock" ...
2021-03-05T05:46:59.372 DEBUG bellperson::gpu::locks > GPU lock acquired!
2021-03-05T05:46:59.469 INFO bellperson::gpu::fft > FFT: 1 working device(s) selected.
2021-03-05T05:46:59.470 INFO bellperson::gpu::fft > FFT: Device 0: GeForce RTX 2080 Ti
2021-03-05T05:46:59.470 INFO bellperson::domain > GPU FFT kernel instantiated!
2021-03-05T05:47:24.467 DEBUG bellperson::gpu::locks > GPU lock released!
thread '' panicked at 'range end index 6043200150033888668 out of range for slice of length 60780374232', /root/.cargo/registry/src/github.com-1ecc6299db9ec823/bellperson-0.12.5/src/groth16/mapped_params.rs:141:16
stack backtrace:
0: 0x2576ca0 - std::backtrace_rs::backtrace::libunwind::trace::he85dfb3ae4206056
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/../../backtrace/src/backtrace/libunwind.rs:96
1: 0x2576ca0 - std::backtrace_rs::backtrace::trace_unsynchronized::h1ad28094d7b00c21
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/../../backtrace/src/backtrace/mod.rs:66
2: 0x2576ca0 - std::sys_common::backtrace::_print_fmt::h901b54610713cd21
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/sys_common/backtrace.rs:79
3: 0x2576ca0 - <std::sys_common::backtrace::_print::DisplayBacktrace as core::fmt::Display>::fmt::hb0ad78ee1571f7e0
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/sys_common/backtrace.rs:58
4: 0x25e545c - core::fmt::write::h1857a60b204f1b6a
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/core/src/fmt/mod.rs:1080
5: 0x2568952 - std::io::Write::write_fmt::hf7b7d7b243f84a36
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/io/mod.rs:1516
6: 0x257ba7d - std::sys_common::backtrace::_print::hd093978a5287b8ff
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/sys_common/backtrace.rs:61
7: 0x257ba7d - std::sys_common::backtrace::print::h20f46787581d56d7
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/sys_common/backtrace.rs:48
8: 0x257ba7d - std::panicking::default_hook::{{closure}}::h486cbb4b82ffc357
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/panicking.rs:208
9: 0x257b728 - std::panicking::default_hook::h4190c9e3edd4d591
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/panicking.rs:227
10: 0x257c2a1 - std::panicking::rust_panic_with_hook::h72e78719cdda225c
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/panicking.rs:577
11: 0x257be49 - std::panicking::begin_panic_handler::{{closure}}::h8bd07dbd34150a96
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/panicking.rs:484
12: 0x257712c - std::sys_common::backtrace::__rust_end_short_backtrace::hdb6b3066ad29028a
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/sys_common/backtrace.rs:153
13: 0x257be09 - rust_begin_unwind
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/std/src/panicking.rs:483
14: 0x25e1781 - core::panicking::panic_fmt::hb15d6f55e8472f62
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/core/src/panicking.rs:85
15: 0x25e7612 - core::slice::index::slice_end_index_len_fail::hd6713db859210b4a
at /rustc/beb5ae474d2835962ebdf7416bd1c9ad864fe101/library/core/src/slice/index.rs:41
16: 0x1f8c204 - bellperson::groth16::mapped_params::read_g1::h004f43cae7169a0b
17: 0x1e8fa9f - <core::iter::adapters::ResultShunt<I,E> as core::iter::traits::iterator::Iterator>::next::h6c8c6ce98d19654b
18: 0x2767520 - <alloc::vec::Vec as alloc::vec::SpecFromIter<T,I>>::from_iter::h8a6371b1a6f7802d
19: 0x1f99b5e - <&bellperson::groth16::mapped_params::MappedParameters as bellperson::groth16::params::ParameterSource>::get_h::h949f5f6ca34ae937
20: 0x1e826a4 - <core::iter::adapters::ResultShunt<I,E> as core::iter::traits::iterator::Iterator>::next::h3634294668c630ae
21: 0x2769f43 - <alloc::vec::Vec as alloc::vec::SpecFromIter<T,I>>::from_iter::ha59406e4b13af32a
22: 0x1ec321d - core::iter::adapters::process_results::he7aadfffdfa06262
23: 0x203d7d3 - bellperson::groth16::prover::create_random_proof_batch_priority::h276c650f8150c79e
24: 0x29246c4 - storage_proofs_core::compound_proof::CompoundProof::circuit_proofs::h77cfb9f28969c7e1
25: 0x2926e9f - storage_proofs_core::compound_proof::CompoundProof::prove::ha227d03058c967dd
26: 0x2111259 - filecoin_proofs::api::post::generate_window_post::h3ce375a36a3720e3
27: 0x1eecb91 - filecoin_proofs_api::post::generate_window_post_inner::h2412de5044ab1125
28: 0x1eebd70 - filecoin_proofs_api::post::generate_window_post::h98bd97b00231eae4
29: 0x1c9bdf1 - <std::panic::AssertUnwindSafe as core::ops::function::FnOnce<()>>::call_once::hec3921fd7d7125a0
30: 0x260c9de - ffi_toolkit::catch_panic_response::he354153ed6d2e058
31: 0x1ddf6f0 - fil_generate_window_post
32: 0x1b50ae6 - _cgo_a8fa62747d41_Cfunc_fil_generate_window_post
at /tmp/go-build/cgo-gcc-prolog:596
33: 0x5a7370 - runtime.asmcgocall
at /usr/local/go/src/runtime/asm_amd64.s:656
2021-03-05T05:47:25.427 DEBUG bellperson::gpu::locks > Priority lock released!
2021-03-05T05:47:25.616+0800 �[34mINFO�[0m storageminer storage/wdpost_run.go:595 computing window post {"batch": 0, "elapsed": 55.337996454}
2021-03-05T05:47:25.616+0800 �[31mERROR�[0m storageminer storage/wdpost_run.go:104 runPost failed: running window post failed:
github.com/filecoin-project/lotus/storage.(*WindowPoStScheduler).runPost
/data/lotus_sources/lotus/lotus/storage/wdpost_run.go:630

Rust panic: no unwind information
github.com/filecoin-project/filecoin-ffi.GenerateWindowPoSt
/data/lotus_sources/lotus/lotus/extern/filecoin-ffi/proofs.go:587
github.com/filecoin-project/lotus/extern/sector-storage/ffiwrapper.(*Sealer).GenerateWindowPoSt
/data/lotus_sources/lotus/lotus/extern/sector-storage/ffiwrapper/verifier_cgo.go:45
github.com/filecoin-project/lotus/storage.(*WindowPoStScheduler).runPost
/data/lotus_sources/lotus/lotus/storage/wdpost_run.go:592
github.com/filecoin-project/lotus/storage.(*WindowPoStScheduler).runGeneratePoST
/data/lotus_sources/lotus/lotus/storage/wdpost_run.go:102
github.com/filecoin-project/lotus/storage.(*WindowPoStScheduler).startGeneratePoST.func1
/data/lotus_sources/lotus/lotus/storage/wdpost_run.go:86
runtime.goexit
/usr/local/go/src/runtime/asm_amd64.s:1374
2021-03-05T05:47:25.616+0800 �[31mERROR�[0m storageminer storage/wdpost_run.go:48 Got err running window post failed:
github.com/filecoin-project/lotus/storage.(*WindowPoStScheduler).runPost
/data/lotus_sources/lotus/lotus/storage/wdpost_run.go:630
Rust panic: no unwind information
github.com/filecoin-project/filecoin-ffi.GenerateWindowPoSt
/data/lotus_sources/lotus/lotus/extern/filecoin-ffi/proofs.go:587
github.com/filecoin-project/lotus/extern/sector-storage/ffiwrapper.(*Sealer).GenerateWindowPoSt
/data/lotus_sources/lotus/lotus/extern/sector-storage/ffiwrapper/verifier_cgo.go:45
github.com/filecoin-project/lotus/storage.(*WindowPoStScheduler).runPost
/data/lotus_sources/lotus/lotus/storage/wdpost_run.go:592
github.com/filecoin-project/lotus/storage.(*WindowPoStScheduler).runGeneratePoST
/data/lotus_sources/lotus/lotus/storage/wdpost_run.go:102
github.com/filecoin-project/lotus/storage.(*WindowPoStScheduler).startGeneratePoST.func1
/data/lotus_sources/lotus/lotus/storage/wdpost_run.go:86
runtime.goexit
/usr/local/go/src/runtime/asm_amd64.s:1374 - TODO handle errors
Done!`,
  },
};
