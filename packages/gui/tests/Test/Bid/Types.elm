module Test.Bid.Types exposing (suite)

import Test exposing (..)
import Fuzz exposing (int)
import Expect
import Bid.Types exposing (..)

suite : Test
suite =
    describe "Bid.Types"
        [ describe "createBid"
            [ test "Values remains" <|
                \() ->
                    Expect.equal
                        (createBid "TSTID" Active "BTC" "1" "ETH" "10")
                        (Bid "TSTID" Active
                            (Value "BTC" "1")
                            (Value "ETH" "10")
                        )
            ]
        , describe "amountStatus"
            [ test "Empty amount" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "")
                        None

            , test "Empty currency"  <|
                \() ->
                    Expect.equal
                        (amountStatus False "" "1")
                        Error

            , test "Letters" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "foo")
                        Error

            , test "Small integer" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "2")
                        (Success "200000000" "satoshi")

            , test "Small integer with formatting" <|
                \() ->
                    Expect.equal
                        (amountStatus True "BTC" "2")
                        (Success "200'000'000" "satoshi")

            , test "Small integer with Bitcoin cash" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BCH" "2")
                        (Success "200000000" "satoshi")

            , test "Large integer with formatting" <|
                \() ->
                    Expect.equal
                        (amountStatus True "ETH" "10001000")
                        (Success "10'001'000'000'000'000'000'000'000" "wei")

            , test "Large integer with formatting in input" <|
                \() ->
                    Expect.equal
                        (amountStatus True "ETH" "10'001'000")
                        (Success "10'001'000'000'000'000'000'000'000" "wei")

            , test "Small float with Bitcoin" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "1.1")
                        (Success "110000000" "satoshi")

            , test "Small float with Ethereum" <|
                \() ->
                    Expect.equal
                        (amountStatus True "ETH" "1.1")
                        (Success "1'100'000'000'000'000'000" "wei")

            , test "Small float with more than one point" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "1.1.1")
                        Error

            , test "Small float with letters in base part" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "1e1.1")
                        Error

            , test "Small float with letters in decimal part" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "1.1e1")
                        Error

            , test "Negative integer" <|
                \() ->
                    Expect.equal
                        (amountStatus False "ETH" "-1")
                        Error

            , test "Integer with letter" <|
                \() ->
                    Expect.equal
                        (amountStatus False "ETH" "e1")
                        Error

            , test "Unknown currency" <|
                \() ->
                    Expect.equal
                        (amountStatus False "DOG" "2")
                        (Success "2" "DOG")

            , test "Zero integer" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "0")
                        Error

            , test "Zero float" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "0.0")
                        Error

            , test "Zero float with beginning point" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" ".0")
                        Error

            , test "Remove initial zeroes" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "000000000001.00001")
                        (Success "100001000" "satoshi")

            , test "Truncate decimals" <|
                \() ->
                    Expect.equal
                        (amountStatus False "BTC" "1.2345678901234567890")
                        (Success "123456789" "satoshi")
            ]
        , describe "amountString"
            [ test "Small integer" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "BTC" "100000000")
                        "1"

            , test "Large integer" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "BTC" "1000100000000000")
                        "10'001'000"

            , test "Small float with Bitcoin" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "BTC" "110000000")
                        "1.1"

            , test "Small float with Ethereum" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "ETH" "1100000000000000000")
                        "1.1"

            , test "Minimal float" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "BTC" "1")
                        "0.00000001"

            , test "Integer plus minimal float" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "BTC" "100000001")
                        "1.00000001"

            , test "Small float plus minimal float" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "BTC" "10000001")
                        "0.10000001"

            , test "Smaller float plus minimal float" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "BTC" "1000001")
                        "0.01000001"

            , test "Remove last zeroes" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "BTC" "100000")
                        "0.001"

            , test "Large integer with minimal float" <|
                \() ->
                    Expect.equal
                        (amountString <| Value "BTC" "1000100000000001")
                        "10'001'000.00000001"
            ]
        , describe "amountString + amountStatus" <|
            let
                performTest currency unit n =
                    if n > 0 then
                        let
                            nstr = toString n
                            actual =
                                amountStatus False currency <|
                                amountString <| Value currency nstr
                        in
                            Expect.equal
                                actual
                                (Success nstr unit)
                    else
                        Expect.pass
            in
                [ fuzz int "Arbitrary integer with Bitcoin" <|
                    performTest "BTC" "satoshi"

                , fuzz int "Arbitrary integer with Ethereum" <|
                    performTest "ETH" "wei"
                ]
        , describe "statusChanged" statusChangedTests
        ]


statusChangedTests : List Test
statusChangedTests =
    [ test "Reports nothign when both lists are empty" <|
        \() ->
            Expect.equal
                (statusChanged [] [])
                []

    , test "Reports nothign when old list is empty" <|
        \() ->
            Expect.equal
                (statusChanged
                    []
                    [createBid "0" Active "BTC" "1" "ETH" "1"]
                )
                []

    , test "Reports nothign when new list is empty" <|
        \() ->
            Expect.equal
                (statusChanged
                    [createBid "0" Active "BTC" "1" "ETH" "1"]
                    []
                )
                []

    , test "Reports a single bid" <|
        \() ->
            Expect.equal
                (statusChanged
                    [ createBid "0" Active  "BTC" "1" "ETH" "1"
                    ]
                    [ createBid "0" Pending "BTC" "1" "ETH" "1"
                    ]
                )
                [ createBid "0" Pending "BTC" "1" "ETH" "1"
                ]

    , test "Doesn't report bids when they have different IDs" <|
        \() ->
            Expect.equal
                (statusChanged
                    [ createBid "0" Active  "BTC" "1" "ETH" "1"
                    ]
                    [ createBid "1" Pending "BTC" "1" "ETH" "1"
                    ]
                )
                []

    , test "Reports change to the bid with the same ID" <|
        \() ->
            Expect.equal
                (statusChanged
                    [ createBid "0" Active  "BTC" "1" "ETH" "1"
                    , createBid "1" Active  "BTC" "1" "ETH" "1"
                    ]
                    [ createBid "0" Pending "BTC" "1" "ETH" "1"
                    , createBid "1" Active  "BTC" "1" "ETH" "1"
                    ]
                )
                [ createBid "0" Pending "BTC" "1" "ETH" "1"
                ]

    , test "Reports change to multiple bids" <|
        \() ->
            Expect.equal
                (statusChanged
                    [ createBid "0" Active  "BTC" "1" "ETH" "1"
                    , createBid "1" Active  "BTC" "1" "ETH" "1"
                    , createBid "2" Active  "BTC" "1" "ETH" "1"
                    ]
                    [ createBid "0" Active  "BTC" "1" "ETH" "1"
                    , createBid "1" Pending "BTC" "1" "ETH" "1"
                    , createBid "2" Pending "BTC" "1" "ETH" "1"
                    , createBid "3" Active  "BTC" "1" "ETH" "1"
                    ]
                )
                [ createBid "1" Pending "BTC" "1" "ETH" "1"
                , createBid "2" Pending "BTC" "1" "ETH" "1"
                ]

    , test "Reports a single finished bid" <|
        \() ->
            Expect.equal
                (statusChanged
                    [ createBid "0" Pending  "BTC" "1" "ETH" "1"
                    ]
                    [ createBid "0" Finished "BTC" "1" "ETH" "1"
                    ]
                )
                [ createBid "0" Finished "BTC" "1" "ETH" "1"
                ]

    , test "Reports both types of status changes" <|
        \() ->
            Expect.equal
                (statusChanged
                    [ createBid "0" Active  "BTC" "1" "ETH" "1"
                    , createBid "1" Pending "BTC" "1" "ETH" "1"
                    ]
                    [ createBid "0" Pending  "BTC" "1" "ETH" "1"
                    , createBid "1" Finished "BTC" "1" "ETH" "1"
                    ]
                )
                [ createBid "0" Pending  "BTC" "1" "ETH" "1"
                , createBid "1" Finished "BTC" "1" "ETH" "1"
                ]
    ]
