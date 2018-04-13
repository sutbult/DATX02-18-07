module Test.Browse.Filter.Types exposing (suite)

import Test exposing (..)
import Expect
import Dict

import Browse.Filter.Types exposing (..)

suite =
    describe "Browse.Filter.Types" <|
        [ describe "getFilter"
            [ test "Correctly filters currencies" <|
                \() ->
                    let
                        model =
                            { from =
                                { title = "From"
                                , query = ""
                                , elements =
                                    Dict.fromList
                                        [ ("Bitcoin", False)
                                        , ("Ethereum", True)
                                        ]
                                }
                            , to =
                                { title = "To"
                                , query = ""
                                , elements =
                                    Dict.fromList
                                        [ ("Bitcoin", True)
                                        , ("Ethereum", False)
                                        ]
                                }
                            }
                    in
                        Expect.equal
                            (getFilter model)
                            (Filter ["Ethereum"] ["Bitcoin"])
            ]
        ]
