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

            , test "Small integer with Bitcoin cash" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin cash" "2")
                        (Success "200000000" "satoshi")

            , test "Large integer with formatting" <|
                \() ->
                    Expect.equal
                        (amountStatus True "Ethereum" "10001000")
                        (Success "10'001'000'000'000'000'000'000'000" "wei")

            , test "Large integer with formatting in input" <|
                \() ->
                    Expect.equal
                        (amountStatus True "Ethereum" "10'001'000")
                        (Success "10'001'000'000'000'000'000'000'000" "wei")

            , test "Small float with Bitcoin" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "1.1")
                        (Success "110000000" "satoshi")

            , test "Small float with Ethereum" <|
                \() ->
                    Expect.equal
                        (amountStatus True "Ethereum" "1.1")
                        (Success "1'100'000'000'000'000'000" "wei")

            , test "Small float with more than one point" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "1.1.1")
                        Error

            , test "Small float with letters in base part" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "1e1.1")
                        Error

            , test "Small float with letters in decimal part" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "1.1e1")
                        Error

            , test "Negative integer" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Ethereum" "-1")
                        Error

            , test "Integer with letter" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Ethereum" "e1")
                        Error

            , test "Unknown currency" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Dogecoin" "2")
                        (Success "2" "dogecoin")

            , test "Zero integer" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "0")
                        Error

            , test "Zero float" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "0.0")
                        Error

            , test "Zero float with beginning point" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" ".0")
                        Error

            , test "Remove initial zeroes" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "000000000001.00001")
                        (Success "100001000" "satoshi")

            , test "Truncate decimals" <|
                \() ->
                    Expect.equal
                        (amountStatus False "Bitcoin" "1.2345678901234567890")
                        (Success "123456789" "satoshi")
            ]
        ]
