module.exports = function(matrix){
    return new SolutionManager(matrix).solved();
};

SolutionManager = function(input_matrix) {
    var values = [], states = [], suggests = [];
    var steps = 0;

    initialize_values(input_matrix);
    get_solution();

    function initialize_values(input_matrix) {
        steps = 0;
        var suggest = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for ( var i=0; i<9; i++) {
            values[i] = [];
            states[i] = [];
            suggests[i] = [];
            for ( var j=0; j<9; j++ ) {
                if ( input_matrix[i][j] != 0) {
                    values[i][j] = input_matrix[i][j];
                    states[i][j] = 'ok';
                    suggests[i][j] = [];
                }
                else {
                    values[i][j] = 0;
                    states[i][j] = 'unknown';
                    suggests[i][j] = suggest;
                }
            }
        }
    };

    function get_solution() {
        var changed = 0;
        do {
            changed = update_possible_values();
            steps++;
            if ( steps >= 10 ) {
                break;
            }
        } while (changed);

        if ( !already_solved()) {
            try_to_solve_randomly();
        }
    };

    function update_possible_values() {
        var changed = 0;
        for ( var i=0; i<9; i++) {
            for ( var j=0; j<9; j++) {
                if ( states[i][j] == 'unknown' ) {
                    changed += solve_explicit_cell(i, j);
                    changed += solve_implicit_cell(i, j);
                }
            }
        }
        return changed;
    };

    function solve_explicit_cell(i, j) {
        suggests[i][j] = get_array_difference(suggests[i][j], row_true_values(i));
        suggests[i][j] = get_array_difference(suggests[i][j], column_true_values(j));
        suggests[i][j] = get_array_difference(suggests[i][j], segment_true_values(i, j));
        if ( 1 == suggests[i][j].length ) {
            mark_cell_as_solved(i, j, suggests[i][j][0]);
            return 1;
        }
        return 0;
    };

    function solve_implicit_cell(i, j) {
        var less_suggest = less_row_suggest(i, j);
        var changed = 0;
        if ( 1 == less_suggest.length ) {
            mark_cell_as_solved(i, j, less_suggest[0]);
            changed++;
        }
        var less_suggest = less_col_suggest(i, j);
        if ( 1 == less_suggest.length ) {
            mark_cell_as_solved(i, j, less_suggest[0]);
            changed++;
        }
        var less_suggest = less_segment_suggest(i, j);
        if ( 1 == less_suggest.length ) {
            mark_cell_as_solved(i, j, less_suggest[0]);
            changed++;
        }
        return changed;
    };

    function mark_cell_as_solved(i, j, value) {
        values[i][j] = value;
        states[i][j] = 'ok';
    };

    function row_true_values(i) {
        var content = [];
        for ( var j=0; j<9; j++ ) {
            if ( states[i][j] == 'ok') {
                content[content.length] = values[i][j];
            }
        }
        return content;
    };

    function column_true_values(j) {
        var content = [];
        for ( var i=0; i<9; i++ ) {
            if ( states[i][j] == 'ok') {
                content[content.length] =  values[i][j];
            }
        }
        return content;
    };

    function segment_true_values(i, j) {
        var content = [];
        var offset = set_segment_offset(i, j);
        for ( var k=0; k<3; k++ ) {
            for ( var l=0; l<3; l++ ) {
                if ( states[offset.i+k][offset.j+l] == 'ok') {
                    content[content.length] = values[offset.i+k][offset.j+l];
                }
            }
        }
        return content;
    };

    function less_row_suggest(i, j) {
        var less_suggest = suggests[i][j];
        for ( var k=0; k<9; k++ ) {
            if ( k == j || states[i][j] == 'ok') {
                continue;
            }
            less_suggest = get_array_difference(less_suggest, suggests[i][k]);
        }
        return less_suggest;
    };

    function less_col_suggest(i, j) {
        var less_suggest = suggests[i][j];
        for ( var k=0; k<9; k++ ) {
            if ( k == i || states[k][j] == 'ok') {
                continue;
            }
            less_suggest = get_array_difference(less_suggest, suggests[k][j]);
        }
        return less_suggest;
    };

    function less_segment_suggest(i, j) {
        var less_suggest = suggests[i][j];
        var offset = set_segment_offset(i, j);
        for ( var k=0; k<3; k++ ) {
            for ( var l=0; l<3; l++ ) {
                if ( ((offset.i+k) == i  && (offset.j+l) == j)|| states[offset.i+k][offset.j+l] == 'ok') {
                    continue;
                }
                less_suggest = get_array_difference(less_suggest, suggests[offset.i+k][offset.j+l]);
            }
        }
        return less_suggest;
    };

    function get_array_difference(ar1, ar2) {
        var resulting_set = [];
        for ( var i=0; i<ar1.length; i++ ) {
            var is_found = false;
            for ( var j=0; j<ar2.length; j++ ) {
                if ( ar1[i] == ar2[j] ) {
                    is_found = true;
                    break;
                }
            }
            if ( !is_found ) {
                resulting_set[resulting_set.length] = ar1[i];
            }
        }
        return resulting_set;
    };

    function set_segment_offset(i, j) {
        return {
            j: Math.floor(j/3)*3,
            i: Math.floor(i/3)*3
        };
    };

    function already_solved() {
        var is_solved = true;
        for ( var i=0; i<9; i++) {
            for ( var j=0; j<9; j++ ) {
                if ( states[i][j] != 'ok') {
                    is_solved = false;
                }
            }
        }
        return is_solved;
    };

    this.already_solved = function() {
        return already_solved();
    };

    function try_to_solve_randomly() {
        var input_matrix = [[], [], [], [], [], [], [], [], []];
        var i_min=-1, j_min=-1, suggests_cnt=1000;
        for ( var i=0; i<9; i++ ) {
            input_matrix[i].length = 9;
            for ( var j=0; j<9; j++ ) {
                input_matrix[i][j] = values[i][j];
                if ( 'unknown' == states[i][j] && (suggests[i][j].length < suggests_cnt) ) {
                    suggests_cnt = suggests[i][j].length;
                    i_min = i;
                    j_min = j;
                }
            }
        }

        for ( var k=0; k<suggests_cnt; k++ ) {
            input_matrix[i_min][j_min] = suggests[i_min][j_min][k];

            var manager = new SolutionManager(input_matrix);
            if ( manager.already_solved() ) {

                var out_val = manager.solved();

                for ( var i=0; i<9; i++ ) {
                    for ( var j=0; j<9; j++ ) {
                        if ( states[i][j] == 'unknown') {
                            mark_cell_as_solved(i, j, out_val[i][j]);
                        }
                    }
                }
                return;
            }
        }
    };

    this.solved = function() {
        return values;
    };
};