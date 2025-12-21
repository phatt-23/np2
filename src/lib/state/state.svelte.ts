//
// Created by phatt-23 on 11/10/2025
//

import type { CNF3 } from "$lib/instance/CNF3";
import type { Graph } from "$lib/instance/Graph";
import { getContext, setContext } from "svelte";
import { ReductionStore } from "./ReductionStore.svelte";
import { instanceToPlain, Type } from "class-transformer";
import Serializer from "$lib/core/Serializer";

export const REDUCTION_STORES_STATE_COOKIE_KEY = '$_reduction_stores_state_cookie';

