module Test.Bid.Types exposing (suite)

import Test exposing (..)
import Expect
import Bid.Types exposing (..)

suite : Test
suite =
    describe "Bid.Types"
        [ describe "amountStatus"
            [ test "Empty amount" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "")
                        None

            , test "Empty currency"  <|
                \() ->
                    Expect.equal
                        (amountStatus False "" "1")
                        Error

            , test "Letters" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "foo")
                        Error

            , test "Small integer" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "2")
                        (Success "200000000" "satoshi")

            , test "Small integer with formatting" <|
                \() ->
                    Expect.equal
                        (amountStatus True "Bitcoin" "2")
                        (Success "200'000'000" "satoshi")

            , test "Large integer with formatting" <|
                \() ->
                    Expect.equal
                        (amountStatus True "Ethereum" "10001000")
                        (Success "10'001'000'000'000'000'000'000'000" "wei")
            ]
        ]
