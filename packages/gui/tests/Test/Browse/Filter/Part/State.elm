module Test.Browse.Filter.Part.State exposing (suite)

import Test exposing (..)
import Fuzz exposing (string)
import Expect
import Dict

import Browse.Filter.Part.Types exposing (..)
import Browse.Filter.Part.State exposing (..)

suite : Test
suite =
    describe "Browse.Filter.Part.State"
        [ describe "init"
            [ fuzz string "Initializes correctly" <|
                \title ->
                    Expect.equal
                        (init title)
                        (   { title = title
                            , query = ""
                            , elements = Dict.empty
                            }
                        , Cmd.none
                        )
            ]
        , describe "subscriptions"
            [ test "Is empty" <|
                \() ->
                    Expect.equal
                        (subscriptions <| Tuple.first <| init "")
                        Sub.none
            ]
        , describe "update"
            [ describe "SetQuery" setQueryTests
            , describe "SetCurrencies" setCurrenciesTests
            , describe "Toggle" toggleTests
            ]
        ]

setQueryTests : List Test
setQueryTests =
    let
        performTest existing new =
            let
                existingModel =
                    { title = ""
                    , query = existing
                    , elements = Dict.empty
                    }
                expectedModel =
                    { title = ""
                    , query = new
                    , elements = Dict.empty
                    }
            in
                Expect.equal
                    (update (SetQuery new) existingModel)
                    (expectedModel, Cmd.none)
    in
        [ fuzz string "Set query" <|
            performTest ""

        , fuzz2 string string "Replace query" <|
            performTest
        ]

setCurrenciesTests : List Test
setCurrenciesTests =
    let
        performTest existingCurrencies newCurrencies expectedCurrencies () =
            let
                existingModel =
                    { title = ""
                    , query = ""
                    , elements = existingCurrencies
                    }
                expectedModel =
                    { title = ""
                    , query = ""
                    , elements = expectedCurrencies
                    }
            in
                Expect.equal
                    (update (SetCurrencies newCurrencies) existingModel)
                    (expectedModel, Cmd.none)
    in
        [ test "Empty model and empty list" <|
            performTest
                Dict.empty
                []
                Dict.empty

        , test "Empty model and list with two elements" <|
            performTest
                Dict.empty
                [ "Bitcoin"
                , "Ethereum"
                ]
                (Dict.fromList
                    [ ("Bitcoin", True)
                    , ("Ethereum", True)
                    ])

        , test "Existing model and empty list" <|
            performTest
                (Dict.fromList
                    [ ("Bitcoin", True)
                    , ("Ethereum", True)
                    ])
                []
                (Dict.fromList
                    [ ("Bitcoin", True)
                    , ("Ethereum", True)
                    ])

        , test "Existing model and list with two elements without overlap" <|
            performTest
                (Dict.fromList
                    [ ("Bitcoin", True)
                    , ("Ethereum", True)
                    ])
                [ "Dogecoin"
                , "Bitcoin cash"
                ]
                (Dict.fromList
                    [ ("Bitcoin", True)
                    , ("Ethereum", True)
                    , ("Dogecoin", True)
                    , ("Bitcoin cash", True)
                    ])

        , test "Existing model and list with two elements with overlap" <|
            performTest
                (Dict.fromList
                    [ ("Bitcoin", True)
                    , ("Ethereum", True)
                    ])
                [ "Dogecoin"
                , "Bitcoin"
                ]
                (Dict.fromList
                    [ ("Bitcoin", True)
                    , ("Ethereum", True)
                    , ("Dogecoin", True)
                    ])

        , test "Existing model and list with two elements with false overlap" <|
            performTest
                (Dict.fromList
                    [ ("Bitcoin", False)
                    , ("Ethereum", True)
                    ])
                [ "Dogecoin"
                , "Bitcoin"
                ]
                (Dict.fromList
                    [ ("Bitcoin", False)
                    , ("Ethereum", True)
                    , ("Dogecoin", True)
                    ])
        ]

toggleTests : List Test
toggleTests =
    let
        performTest existingCurrencies toggle expectedCurrencies () =
            let
                existingModel =
                    { title = ""
                    , query = ""
                    , elements = Dict.fromList existingCurrencies
                    }
                expectedModel =
                    { title = ""
                    , query = ""
                    , elements = Dict.fromList expectedCurrencies
                    }
            in
                Expect.equal
                    (update (Toggle toggle) existingModel)
                    (expectedModel, Cmd.none)
    in
        [ test "Toggle True element" <|
            performTest
                [ ("Bitcoin", True)
                , ("Ethereum", True)
                ]
                "Bitcoin"
                [ ("Bitcoin", False)
                , ("Ethereum", True)
                ]

        , test "Toggle False element" <|
            performTest
                [ ("Bitcoin", True)
                , ("Ethereum", False)
                ]
                "Ethereum"
                [ ("Bitcoin", True)
                , ("Ethereum", True)
                ]

        , test "Toggle nonexistent element" <|
            performTest
                [ ("Bitcoin", False)
                , ("Ethereum", True)
                ]
                "Dogecoin"
                [ ("Bitcoin", False)
                , ("Ethereum", True)
                ]
        ]
