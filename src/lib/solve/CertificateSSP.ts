// Created by phatt-23 on 22/10/2025

import Serializer from "$lib/core/Serializer";
import type { SSPNumber } from "$lib/instance/SSP";
import type { Certificate } from "./Certificate";

@Serializer.SerializableClass()
export class CertificateSSP implements Certificate {
    numbers: SSPNumber[];

    constructor(numbers: SSPNumber[]) {
        this.numbers = numbers;
    }
}
