// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect } from "chai";
import "mocha";

import { Position } from "vscode-languageserver-types";
import * as LanguageServices from "../powerquery-language-services";
import { TextDocument } from "../powerquery-language-services";
import * as WorkspaceCache from "../powerquery-language-services/workspaceCache";
import * as TestUtils from "./testUtils";

describe("workspaceCache", () => {
    it("getLexerState", () => {
        const document: TextDocument = TestUtils.documentFromText("let\n   b = 1\n   in b");
        const cacheItem: WorkspaceCache.LexerCacheItem = WorkspaceCache.getLexerState(document, undefined);
        TestUtils.assertLexerCacheItemOk(cacheItem);
        expect(cacheItem.value.lines.length).to.equal(3);
    });

    it("getTriedLexerSnapshot", () => {
        const document: TextDocument = TestUtils.documentFromText("let a = 1 in a");
        const cacheItem: WorkspaceCache.TLexerSnapshotCacheItem = WorkspaceCache.getTriedLexerSnapshot(
            document,
            undefined,
        );
        TestUtils.assertLexerSnapshotCacheItemOk(cacheItem);
        expect(cacheItem.value.tokens.length).to.equal(6);
    });

    it("getTriedLexParse", () => {
        const document: TextDocument = TestUtils.documentFromText("let c = 1 in c");
        const cacheItem: WorkspaceCache.TParserCacheItem = WorkspaceCache.getTriedParse(document, undefined);
        TestUtils.assertParserCacheItemOk(cacheItem);
    });

    it("getTriedLexParse with error", () => {
        const document: TextDocument = TestUtils.documentFromText("let c = 1, in c");
        const cacheItem: WorkspaceCache.TParserCacheItem = WorkspaceCache.getTriedParse(document, undefined);
        TestUtils.assertParserCacheItemErr(cacheItem);
    });

    it("getInspection", () => {
        const [document, postion]: [TestUtils.MockDocument, Position] = TestUtils.documentAndPositionFrom(
            "let c = 1 in |c",
        );
        const cacheItem: WorkspaceCache.TInspectionCacheItem | undefined = WorkspaceCache.getTriedInspection(
            document,
            postion,
            undefined,
        );
        TestUtils.assertIsDefined(cacheItem);
        TestUtils.assertInspectionCacheItemOk(cacheItem);
    });

    it("getInspection with parser error", () => {
        const [document, postion]: [TestUtils.MockDocument, Position] = TestUtils.documentAndPositionFrom(
            "let c = 1, in |",
        );
        const cacheItem: WorkspaceCache.TInspectionCacheItem | undefined = WorkspaceCache.getTriedInspection(
            document,
            postion,
            undefined,
        );
        TestUtils.assertIsDefined(cacheItem);
        TestUtils.assertInspectionCacheItemOk(cacheItem);
    });
});

describe("top level workspace functions", () => {
    it("document operations", () => {
        const document: TextDocument = TestUtils.documentFromText("let c = 1 in c");
        LanguageServices.documentUpdated(document, [], document.version + 1);
        LanguageServices.documentUpdated(document, [], document.version + 2);
        LanguageServices.documentClosed(document);
        LanguageServices.documentClosed(document);
        LanguageServices.documentUpdated(document, [], document.version);
    });
});
