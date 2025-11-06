#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env

import { Command } from "@cliffy/command";
import pkg from "./deno.json" with { type: "json" };
import { createBridgeNetworkIfNeeded } from "./src/network.ts";
import inspect from "./src/subcommands/inspect.ts";
import ps from "./src/subcommands/ps.ts";
import rm from "./src/subcommands/rm.ts";
import start from "./src/subcommands/start.ts";
import stop from "./src/subcommands/stop.ts";
import {
  createDriveImageIfNeeded,
  downloadIso,
  emptyDiskImage,
  handleInput,
  type Options,
  runQemu,
} from "./src/utils.ts";

if (import.meta.main) {
  await new Command()
    .name("openindiana-up")
    .version(pkg.version)
    .description("Start a OpenIndiana virtual machine using QEMU")
    .arguments(
      "[path-or-url-to-iso-or-version:string]",
    )
    .option("-o, --output <path:string>", "Output path for downloaded ISO")
    .option("-c, --cpu <type:string>", "Type of CPU to emulate", {
      default: "host",
    })
    .option("-C, --cpus <number:number>", "Number of CPU cores", {
      default: 2,
    })
    .option("-m, --memory <size:string>", "Amount of memory for the VM", {
      default: "2G",
    })
    .option("-i, --image <path:string>", "Path to VM disk image")
    .option(
      "--disk-format <format:string>",
      "Disk image format (e.g., qcow2, raw)",
      {
        default: "raw",
      },
    )
    .option(
      "--size <size:string>",
      "Size of the VM disk image to create if it does not exist (e.g., 20G)",
      {
        default: "20G",
      },
    )
    .option(
      "-b, --bridge <name:string>",
      "Name of the network bridge to use for networking (e.g., br0)",
    )
    .example(
      "Default usage",
      "openindiana-up",
    )
    .example(
      "Specific version",
      "openindiana-up 20251026",
    )
    .example(
      "Local ISO file",
      "openindiana-up /path/to/openindiana.iso",
    )
    .example(
      "Download URL",
      "openindiana-up https://dlc.openindiana.org/isos/hipster/20251026/OI-hipster-text-20251026.iso",
    )
    .example(
      "List running VMs",
      "openindiana-up ps",
    )
    .example(
      "List all VMs",
      "openindiana-up ps --all",
    )
    .example(
      "Start a VM",
      "openindiana-up start my-vm",
    )
    .example(
      "Stop a VM",
      "openindiana-up stop my-vm",
    )
    .example(
      "Inspect a VM",
      "openindiana-up inspect my-vm",
    )
    .example(
      "Remove a VM",
      "openindiana-up rm my-vm",
    )
    .action(async (options: Options, input?: string) => {
      const resolvedInput = handleInput(input);
      let isoPath: string | null = resolvedInput;

      if (
        resolvedInput.startsWith("https://") ||
        resolvedInput.startsWith("http://")
      ) {
        isoPath = await downloadIso(resolvedInput, options);
      }

      if (options.image) {
        await createDriveImageIfNeeded(options);
      }

      if (!input && options.image && !await emptyDiskImage(options.image)) {
        isoPath = null;
      }

      if (options.bridge) {
        await createBridgeNetworkIfNeeded(options.bridge);
      }

      await runQemu(isoPath, options);
    })
    .command("ps", "List all virtual machines")
    .option("--all, -a", "Show all virtual machines, including stopped ones")
    .action(async (options: { all?: unknown }) => {
      await ps(Boolean(options.all));
    })
    .command("start", "Start a virtual machine")
    .arguments("<vm-name:string>")
    .action(async (_options: unknown, vmName: string) => {
      await start(vmName);
    })
    .command("stop", "Stop a virtual machine")
    .arguments("<vm-name:string>")
    .action(async (_options: unknown, vmName: string) => {
      await stop(vmName);
    })
    .command("inspect", "Inspect a virtual machine")
    .arguments("<vm-name:string>")
    .action(async (_options: unknown, vmName: string) => {
      await inspect(vmName);
    })
    .command("rm", "Remove a virtual machine")
    .arguments("<vm-name:string>")
    .action(async (_options: unknown, vmName: string) => {
      await rm(vmName);
    })
    .parse(Deno.args);
}
