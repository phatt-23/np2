// Created by phatt-23 on 22/10/2025

import type CertRendererTSP from "$lib/component/CertRendererTSP.svelte";
import type { Unsolvable } from "$lib/core/Unsolvable";
import type { Graph } from "$lib/instance/Graph";
import type { CertificateHCIRCUIT } from "$lib/solve/CertificateHCIRCUIT";
import { CertificateTSP } from "$lib/solve/CertificateTSP";
import type { Decoder } from "./Decoder";

export class DecoderTSPtoHCIRCUIT implements Decoder<Graph, CertificateHCIRCUIT, CertificateTSP> {
    decode(outInstance: Graph, outCert: CertificateHCIRCUIT): CertificateTSP {
        return new CertificateTSP(outCert.path);
    }
}